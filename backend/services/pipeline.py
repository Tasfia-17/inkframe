"""Core generation pipeline — all 8 features."""
import asyncio
from pathlib import Path
from sqlalchemy.orm import Session
from database import SessionLocal, Project, Scene
from task_store import update_task, complete_task, fail_task, is_task_cancelled
from services.story_parser import parse_story
from services.runway_client import generate_frame, upload_frame, animate_frame, generate_character_ref
from services.audio_service import generate_narration, generate_sfx
from services.polish_service import polish_clip
from services.assembler import assemble_video


def run_generation_job(project_id: int, task_id: str):
    asyncio.run(_run(project_id, task_id))


async def _run(project_id: int, task_id: str):
    db = SessionLocal()
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            fail_task(task_id, project_id, "Project not found")
            return

        video_model = project.video_model or "gen4_turbo"
        video_ratio = project.video_ratio or "1280:720"
        enable_narration = project.enable_narration
        enable_sfx = project.enable_sfx
        enable_subtitles = project.enable_subtitles
        enable_polish = project.enable_polish
        polish_prompt = project.polish_prompt or "cinematic film grain, enhance colors, dramatic lighting"
        style_ref_uri = project.style_ref_runway_uri
        char_ref_uri = project.char_ref_runway_uri

        # ── Stage 1: Parse story ──────────────────────────────────────────
        update_task(task_id, "parsing_story", 0, 1, "Analyzing story...")
        if is_task_cancelled(task_id): return

        try:
            scenes_data = parse_story(project.story_text)
        except Exception as e:
            fail_task(task_id, project_id, f"Story parsing failed: {e}")
            return

        db.query(Scene).filter(Scene.project_id == project_id).delete()
        for i, s in enumerate(scenes_data):
            db.add(Scene(
                project_id=project_id, index=i,
                description=s.get("description", ""),
                visual_prompt=s.get("visual_prompt", ""),
                motion_prompt=s.get("motion_prompt", ""),
                narration_text=s.get("narration_text", ""),
                sfx_prompt=s.get("sfx_prompt", ""),
            ))
        db.query(Project).filter(Project.id == project_id).update({"scene_count": len(scenes_data)})
        db.commit()
        total = len(scenes_data)

        # ── Stage 2: Character reference (feature 6) ─────────────────────
        if not char_ref_uri:
            # Auto-extract character description from story
            char_desc = _extract_character(project.story_text)
            if char_desc:
                update_task(task_id, "generating_frames", 0, total, "Generating character reference...")
                try:
                    char_path, char_uri = await generate_character_ref(char_desc, project_id)
                    db.query(Project).filter(Project.id == project_id).update({
                        "char_ref_path": str(char_path),
                        "char_ref_runway_uri": char_uri,
                    })
                    db.commit()
                    char_ref_uri = char_uri
                except Exception:
                    pass  # non-fatal

        # ── Stage 3: Generate storyboard frames ──────────────────────────
        update_task(task_id, "generating_frames", 0, total, "Generating storyboard frames...")
        if is_task_cancelled(task_id): return

        scenes = db.query(Scene).filter(Scene.project_id == project_id).order_by(Scene.index).all()
        done = 0

        async def gen_frame(scene: Scene):
            nonlocal done
            if is_task_cancelled(task_id): return
            try:
                _db_update(scene.id, {"status": "generating_frame"}, db)
                frame_path = await generate_frame(
                    scene.visual_prompt, project_id, scene.index,
                    style_ref_uri=style_ref_uri,
                    char_ref_uri=char_ref_uri,
                )
                runway_uri = await upload_frame(frame_path)
                _db_update(scene.id, {"frame_path": str(frame_path), "frame_runway_uri": runway_uri, "status": "frame_done"}, db)
            except Exception as e:
                _db_update(scene.id, {"status": "error", "error": str(e)}, db)
            done += 1
            update_task(task_id, "generating_frames", done, total)

        await asyncio.gather(*[gen_frame(s) for s in scenes])
        if is_task_cancelled(task_id): return

        # ── Stage 4: Animate frames → clips ──────────────────────────────
        update_task(task_id, "animating_clips", 0, total, "Animating scenes...")
        db.expire_all()
        scenes = db.query(Scene).filter(Scene.project_id == project_id).order_by(Scene.index).all()
        done = 0

        async def animate(scene: Scene):
            nonlocal done
            if is_task_cancelled(task_id) or not scene.frame_runway_uri: return
            try:
                _db_update(scene.id, {"status": "generating_clip"}, db)
                clip_path, clip_url = await animate_frame(
                    scene.frame_runway_uri, scene.motion_prompt,
                    project_id, scene.index, video_model=video_model,
                    video_ratio=video_ratio,
                )
                _db_update(scene.id, {"clip_path": str(clip_path), "clip_url": clip_url, "status": "clip_done"}, db)
            except Exception as e:
                _db_update(scene.id, {"status": "error", "error": str(e)}, db)
            done += 1
            update_task(task_id, "animating_clips", done, total)

        await asyncio.gather(*[animate(s) for s in scenes])
        if is_task_cancelled(task_id): return

        # ── Stage 5: Audio — narration + SFX (features 1 & 2) ────────────
        db.expire_all()
        scenes = db.query(Scene).filter(Scene.project_id == project_id).order_by(Scene.index).all()
        narration_paths: list[Path | None] = [None] * total
        sfx_paths: list[Path | None] = [None] * total

        if enable_narration or enable_sfx:
            update_task(task_id, "generating_audio", 0, total, "Generating audio...")
            done = 0

            async def gen_audio(scene: Scene):
                nonlocal done
                if is_task_cancelled(task_id): return
                try:
                    if enable_narration and scene.narration_text:
                        narr_path = await generate_narration(scene.narration_text, project_id, scene.index)
                        narration_paths[scene.index] = narr_path
                        _db_update(scene.id, {"narration_path": str(narr_path)}, db)
                    if enable_sfx and scene.sfx_prompt:
                        sfx_path = await generate_sfx(scene.sfx_prompt, project_id, scene.index)
                        sfx_paths[scene.index] = sfx_path
                        _db_update(scene.id, {"sfx_path": str(sfx_path)}, db)
                except Exception as e:
                    import logging
                    logging.warning(f"Audio generation failed for scene {scene.index}: {e}")
                done += 1
                update_task(task_id, "generating_audio", done, total)

            await asyncio.gather(*[gen_audio(s) for s in scenes])
            if is_task_cancelled(task_id): return

        # ── Stage 6: Polish pass — gen4_aleph (feature 7) ────────────────
        db.expire_all()
        scenes = db.query(Scene).filter(Scene.project_id == project_id).order_by(Scene.index).all()

        if enable_polish:
            update_task(task_id, "polishing", 0, total, "Applying cinematic polish...")
            done = 0

            async def polish(scene: Scene):
                nonlocal done
                if is_task_cancelled(task_id) or not scene.clip_path: return
                try:
                    polished = await polish_clip(Path(scene.clip_path), polish_prompt, project_id, scene.index)
                    _db_update(scene.id, {"polished_clip_path": str(polished)}, db)
                except Exception as e:
                    import logging
                    logging.warning(f"Polish failed for scene {scene.index}: {e}")
                done += 1
                update_task(task_id, "polishing", done, total)

            await asyncio.gather(*[polish(s) for s in scenes])
            if is_task_cancelled(task_id): return

        # ── Stage 7: Assemble final video ─────────────────────────────────
        update_task(task_id, "assembling_video", 0, 1, "Assembling final video...")
        db.expire_all()
        scenes = db.query(Scene).filter(Scene.project_id == project_id).order_by(Scene.index).all()

        # Use polished clips if available, else original
        clip_paths = []
        narration_texts = []
        for s in scenes:
            if enable_polish and s.polished_clip_path and Path(s.polished_clip_path).exists():
                clip_paths.append(Path(s.polished_clip_path))
            elif s.clip_path and Path(s.clip_path).exists():
                clip_paths.append(Path(s.clip_path))
            narration_texts.append(s.narration_text)

        if not clip_paths:
            fail_task(task_id, project_id, "No clips were generated")
            return

        try:
            final_path = await assemble_video(project_id, clip_paths, narration_paths, sfx_paths, narration_texts, enable_subtitles)
        except Exception as e:
            fail_task(task_id, project_id, f"Assembly failed: {e}")
            return

        # Mark all scenes completed
        for s in scenes:
            if s.clip_path:
                db.query(Scene).filter(Scene.id == s.id).update({"status": "completed"})

        db.query(Project).filter(Project.id == project_id).update({"final_video_path": str(final_path)})
        db.commit()
        complete_task(task_id, project_id)

    except Exception as e:
        fail_task(task_id, project_id, str(e))
    finally:
        db.close()


def _db_update(scene_id: int, values: dict, db: Session):
    """Update scene in the provided session (no new connection)."""
    db.query(Scene).filter(Scene.id == scene_id).update(values)
    db.commit()
    db.expire_all()  # Refresh objects after commit


def _extract_character(story_text: str) -> str | None:
    """Simple heuristic: return first 100 chars as character description seed."""
    # The LLM will do the heavy lifting in generate_character_ref prompt
    words = story_text.split()[:30]
    return " ".join(words) if words else None
