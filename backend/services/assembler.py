"""Assemble video clips + audio into final video using ffmpeg."""
import asyncio
from pathlib import Path
from config import OUTPUTS_DIR


async def assemble_video(
    project_id: int,
    clip_paths: list[Path],
    narration_paths: list[Path | None] | None = None,
    sfx_paths: list[Path | None] | None = None,
    narration_texts: list[str | None] | None = None,
    enable_subtitles: bool = False,
) -> Path:
    out_dir = OUTPUTS_DIR / str(project_id)
    out_dir.mkdir(parents=True, exist_ok=True)

    # Step 1: Concatenate video clips
    concat_file = out_dir / "concat.txt"
    concat_file.write_text("\n".join(f"file '{p.resolve()}'" for p in clip_paths))
    raw_video = out_dir / "raw.mp4"
    await _run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_file), "-c", "copy", str(raw_video)])

    # Step 2: If no audio, return raw video
    has_narration = narration_paths and any(p for p in narration_paths if p and p.exists())
    has_sfx = sfx_paths and any(p for p in sfx_paths if p and p.exists())
    if not has_narration and not has_sfx:
        if enable_subtitles and narration_texts:
            return await _add_subtitles(raw_video, narration_texts, clip_paths, out_dir)
        raw_video.rename(out_dir / "final.mp4")
        return out_dir / "final.mp4"

    # Step 3: Build per-scene audio (narration + sfx mixed) then concatenate
    scene_audio_files = []
    for i, clip_path in enumerate(clip_paths):
        dur = await _get_duration(clip_path)
        narr = narration_paths[i] if narration_paths and i < len(narration_paths) else None
        sfx = sfx_paths[i] if sfx_paths and i < len(sfx_paths) else None

        scene_audio = out_dir / f"scene_audio_{i:03d}.mp3"
        if narr and narr.exists() and sfx and sfx.exists():
            await _run(["ffmpeg", "-y",
                  "-i", str(narr), "-i", str(sfx),
                  "-filter_complex",
                  f"[0:a]volume=1.0[narr];[1:a]volume=0.3[sfx];[narr][sfx]amix=inputs=2:duration=shortest[out]",
                  "-map", "[out]", "-t", str(dur), str(scene_audio)])
        elif narr and narr.exists():
            await _run(["ffmpeg", "-y", "-i", str(narr), "-t", str(dur), str(scene_audio)])
        elif sfx and sfx.exists():
            await _run(["ffmpeg", "-y", "-i", str(sfx), "-t", str(dur), str(scene_audio)])
        else:
            await _run(["ffmpeg", "-y", "-f", "lavfi", "-i", f"anullsrc=r=44100:cl=stereo",
                  "-t", str(dur), str(scene_audio)])
        scene_audio_files.append(scene_audio)

    # Step 4: Concatenate all scene audio
    audio_concat = out_dir / "audio_concat.txt"
    audio_concat.write_text("\n".join(f"file '{p.resolve()}'" for p in scene_audio_files))
    full_audio = out_dir / "full_audio.mp3"
    await _run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(audio_concat), "-c", "copy", str(full_audio)])

    # Step 5: Merge video + audio
    final = out_dir / "final.mp4"
    await _run(["ffmpeg", "-y", "-i", str(raw_video), "-i", str(full_audio),
          "-c:v", "copy", "-c:a", "aac", "-shortest", str(final)])

    # Step 6: Add subtitles if enabled
    if enable_subtitles and narration_texts:
        return await _add_subtitles(final, narration_texts, clip_paths, out_dir)

    return final


async def _add_subtitles(video_path: Path, narration_texts: list[str | None], clip_paths: list[Path], out_dir: Path) -> Path:
    """Burn subtitles into video using SRT file."""
    srt_path = out_dir / "subtitles.srt"
    
    # Generate SRT file
    srt_lines = []
    current_time = 0.0
    for i, (text, clip_path) in enumerate(zip(narration_texts, clip_paths)):
        if not text:
            current_time += await _get_duration(clip_path)
            continue
        
        duration = await _get_duration(clip_path)
        start = _format_srt_time(current_time)
        end = _format_srt_time(current_time + duration)
        
        srt_lines.append(f"{i + 1}")
        srt_lines.append(f"{start} --> {end}")
        srt_lines.append(text)
        srt_lines.append("")
        
        current_time += duration
    
    srt_path.write_text("\n".join(srt_lines), encoding="utf-8")
    
    # Burn subtitles into video
    subtitled_path = out_dir / "final_subtitled.mp4"
    await _run([
        "ffmpeg", "-y", "-i", str(video_path),
        "-vf", f"subtitles={srt_path}:force_style='FontSize=18,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2,Alignment=2'",
        "-c:a", "copy", str(subtitled_path)
    ])
    
    return subtitled_path


def _format_srt_time(seconds: float) -> str:
    """Convert seconds to SRT time format (HH:MM:SS,mmm)."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


async def _run(cmd: list[str]):
    """Run ffmpeg command asynchronously."""
    proc = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg error: {stderr.decode()[-500:]}")


async def _get_duration(video_path: Path) -> float:
    """Get video duration asynchronously."""
    proc = await asyncio.create_subprocess_exec(
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(video_path),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await proc.communicate()
    try:
        return float(stdout.decode().strip())
    except Exception:
        return 5.0
