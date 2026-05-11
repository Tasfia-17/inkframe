"""Projects router — CRUD + trigger generation + scene editing + file uploads."""
import base64
from pathlib import Path
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy.orm import Session
from redis import Redis
from rq import Queue
from database import get_db, Project, Scene
from auth import get_current_user
from task_store import create_task, cancel_task, reconcile_task
from config import REDIS_URL, TASK_QUEUE_NAME, RUN_TASKS_INLINE, OUTPUTS_DIR
from services.runway_client import upload_frame
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/projects", tags=["projects"])

VIDEO_MODELS = ["gen4_turbo", "gen4.5", "seedance2", "veo3.1_fast", "veo3.1", "gen3a_turbo"]
ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
ALLOWED_VIDEO_RATIOS = ["1280:720", "720:1280", "1080:1920", "1920:1080"]


def _enqueue(project_id: int, task_id: str, background_tasks: BackgroundTasks):
    if RUN_TASKS_INLINE:
        from services.pipeline import run_generation_job
        background_tasks.add_task(run_generation_job, project_id, task_id)
    else:
        q = Queue(TASK_QUEUE_NAME, connection=Redis.from_url(REDIS_URL))
        q.enqueue("services.pipeline.run_generation_job", project_id, task_id, job_timeout="3h")


class CreateProjectBody(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    story_text: str = Field(..., min_length=10, max_length=10000)
    video_model: str = "gen4_turbo"
    video_ratio: str = "1280:720"
    enable_narration: bool = True
    enable_sfx: bool = True
    enable_subtitles: bool = True
    enable_polish: bool = False
    polish_prompt: Optional[str] = Field(None, max_length=500)
    narrator_voice: str = "Rachel"


class UpdateSceneBody(BaseModel):
    visual_prompt: Optional[str] = None
    motion_prompt: Optional[str] = None
    narration_text: Optional[str] = None
    sfx_prompt: Optional[str] = None


@router.post("", status_code=201)
def create_project(body: CreateProjectBody, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if body.video_model not in VIDEO_MODELS:
        raise HTTPException(400, f"Invalid model. Choose from: {VIDEO_MODELS}")
    if body.video_ratio not in ALLOWED_VIDEO_RATIOS:
        raise HTTPException(400, f"Invalid ratio. Choose from: {ALLOWED_VIDEO_RATIOS}")
    project = Project(
        user_id=user.id, title=body.title, story_text=body.story_text,
        video_model=body.video_model,
        video_ratio=body.video_ratio,
        enable_narration=body.enable_narration,
        enable_sfx=body.enable_sfx,
        enable_subtitles=body.enable_subtitles,
        enable_polish=body.enable_polish,
        polish_prompt=body.polish_prompt,
        narrator_voice=body.narrator_voice,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return _project_dict(project)


@router.get("/usage")
async def get_usage(user=Depends(get_current_user)):
    from services.runway_client import get_org_usage
    usage = await get_org_usage()
    return usage


@router.get("")
def list_projects(db: Session = Depends(get_db), user=Depends(get_current_user)):
    projects = db.query(Project).filter(Project.user_id == user.id).order_by(Project.created_at.desc()).all()
    return [_project_dict(p) for p in projects]


@router.get("/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = _get_owned(project_id, user.id, db)
    scenes = db.query(Scene).filter(Scene.project_id == project_id).order_by(Scene.index).all()
    return {**_project_dict(project), "scenes": [_scene_dict(s) for s in scenes]}


# Feature 3: Edit scene prompts before generation
@router.patch("/{project_id}/scenes/{scene_index}")
def update_scene(project_id: int, scene_index: int, body: UpdateSceneBody,
                 db: Session = Depends(get_db), user=Depends(get_current_user)):
    _get_owned(project_id, user.id, db)
    scene = db.query(Scene).filter(Scene.project_id == project_id, Scene.index == scene_index).first()
    if not scene:
        raise HTTPException(404, "Scene not found")
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    db.query(Scene).filter(Scene.id == scene.id).update(updates)
    db.commit()
    db.refresh(scene)
    return _scene_dict(scene)


# Feature 5: Upload style reference image
@router.post("/{project_id}/style-ref")
async def upload_style_ref(project_id: int, file: UploadFile = File(...),
                            db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = _get_owned(project_id, user.id, db)
    
    # Validate file extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(400, f"Invalid file type. Allowed: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}")
    
    out_dir = OUTPUTS_DIR / str(project_id)
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"style_ref{ext}"
    path.write_bytes(await file.read())
    
    try:
        runway_uri = await upload_frame(path)
    except Exception as e:
        logger.error(f"Runway upload failed: {e}")
        raise HTTPException(500, "Failed to upload to Runway")
    
    db.query(Project).filter(Project.id == project_id).update({
        "style_ref_path": str(path), "style_ref_runway_uri": runway_uri
    })
    db.commit()
    return {"style_ref_path": str(path), "style_ref_runway_uri": runway_uri}


# Feature 6: Upload character reference image
@router.post("/{project_id}/char-ref")
async def upload_char_ref(project_id: int, file: UploadFile = File(...),
                           db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = _get_owned(project_id, user.id, db)
    
    # Validate file extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(400, f"Invalid file type. Allowed: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}")
    
    out_dir = OUTPUTS_DIR / str(project_id)
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"char_ref{ext}"
    path.write_bytes(await file.read())
    
    try:
        runway_uri = await upload_frame(path)
    except Exception as e:
        logger.error(f"Runway upload failed: {e}")
        raise HTTPException(500, "Failed to upload to Runway")
    
    db.query(Project).filter(Project.id == project_id).update({
        "char_ref_path": str(path), "char_ref_runway_uri": runway_uri
    })
    db.commit()
    return {"char_ref_path": str(path), "char_ref_runway_uri": runway_uri}


class AnalyzeStoryBody(BaseModel):
    story_text: str = Field(..., min_length=10, max_length=10000)


@router.post("/analyze-story")
def analyze_story_endpoint(body: AnalyzeStoryBody, user=Depends(get_current_user)):
    """Pre-generation story quality check — returns scores, emotional arc, and a tip."""
    from services.story_parser import analyze_story
    return analyze_story(body.story_text)


@router.post("/{project_id}/generate")
def start_generation(project_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = _get_owned(project_id, user.id, db)
    if project.status == "processing":
        raise HTTPException(409, "Generation already in progress")
    task_id = create_task(project_id)
    _enqueue(project_id, task_id, background_tasks)
    return {"task_id": task_id}


@router.post("/{project_id}/cancel")
def cancel_generation(project_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = _get_owned(project_id, user.id, db)
    if project.current_task_id:
        cancel_task(project.current_task_id, project_id)
    return {"ok": True}


@router.get("/{project_id}/task-status")
def task_status(project_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    _get_owned(project_id, user.id, db)
    return reconcile_task(project_id) or {"stage": "idle"}


@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = _get_owned(project_id, user.id, db)
    db.delete(project)
    db.commit()


@router.get("/{project_id}/storyboard-pdf")
def export_storyboard_pdf(project_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    from services.storyboard_export import generate_storyboard_pdf
    project = _get_owned(project_id, user.id, db)
    scenes = db.query(Scene).filter(Scene.project_id == project_id).order_by(Scene.index).all()
    if not any(s.frame_path for s in scenes):
        raise HTTPException(404, "No storyboard frames generated yet")
    pdf_path = generate_storyboard_pdf(project, scenes)
    db.query(Project).filter(Project.id == project_id).update({"storyboard_pdf_path": str(pdf_path)})
    db.commit()
    from fastapi.responses import FileResponse
    return FileResponse(pdf_path, media_type="application/pdf", filename=f"{project.title}_storyboard.pdf")


@router.post("/{project_id}/dub")
async def dub_video(project_id: int, target_lang: str = Form(...), db: Session = Depends(get_db), user=Depends(get_current_user)):
    from services.dubbing_service import dub_video_audio
    project = _get_owned(project_id, user.id, db)
    if not project.final_video_path or not Path(project.final_video_path).exists():
        raise HTTPException(404, "Final video not found")
    dubbed_path = await dub_video_audio(Path(project.final_video_path), target_lang, project_id)
    from fastapi.responses import FileResponse
    return FileResponse(dubbed_path, media_type="video/mp4", filename=f"{project.title}_{target_lang}.mp4")


def _get_owned(project_id: int, user_id: int, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
    if not project:
        raise HTTPException(404, "Project not found")
    return project


def _project_dict(p: Project) -> dict:
    return {
        "id": p.id, "title": p.title, "status": p.status,
        "scene_count": p.scene_count, "final_video_path": p.final_video_path,
        "video_model": p.video_model,
        "video_ratio": p.video_ratio,
        "enable_narration": p.enable_narration,
        "enable_sfx": p.enable_sfx,
        "enable_subtitles": p.enable_subtitles,
        "enable_polish": p.enable_polish,
        "polish_prompt": p.polish_prompt,
        "narrator_voice": p.narrator_voice,
        "style_ref_path": p.style_ref_path,
        "char_ref_path": p.char_ref_path,
        "storyboard_pdf_path": p.storyboard_pdf_path,
        "created_at": p.created_at.isoformat(),
        "current_task_id": p.current_task_id,
    }


def _scene_dict(s: Scene) -> dict:
    return {
        "id": s.id, "index": s.index, "description": s.description,
        "visual_prompt": s.visual_prompt, "motion_prompt": s.motion_prompt,
        "narration_text": s.narration_text, "sfx_prompt": s.sfx_prompt,
        "frame_path": s.frame_path, "clip_path": s.clip_path,
        "polished_clip_path": s.polished_clip_path,
        "narration_path": s.narration_path, "sfx_path": s.sfx_path,
        "clip_url": s.clip_url, "status": s.status, "error": s.error,
    }
