"""SSE progress stream + file serving."""
import json
import asyncio
import mimetypes
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, FileResponse
from database import get_db, Project, Scene
from auth import get_current_user
from task_store import get_task_progress
from config import OUTPUTS_DIR

router = APIRouter(prefix="/api", tags=["stream"])


@router.get("/progress/{task_id}")
async def progress_stream(task_id: str):
    async def generate():
        while True:
            prog = get_task_progress(task_id)
            if prog is None:
                yield f"data: {json.dumps({'stage': 'not_found'})}\n\n"
                break
            yield f"data: {json.dumps(prog)}\n\n"
            if prog["stage"] in ("completed", "error", "cancelled"):
                break
            await asyncio.sleep(1)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.get("/projects/{project_id}/video")
def serve_final_video(project_id: int, db=Depends(get_db), user=Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user.id).first()
    if not project or not project.final_video_path:
        raise HTTPException(status_code=404, detail="Video not found")
    path = Path(project.final_video_path)
    if not path.exists():
        raise HTTPException(status_code=404, detail="Video file missing")
    return FileResponse(path, media_type="video/mp4", filename=f"{project.title}.mp4")


@router.get("/projects/{project_id}/scenes/{scene_index}/frame")
def serve_frame(project_id: int, scene_index: int, db=Depends(get_db), user=Depends(get_current_user)):
    scene = db.query(Scene).filter(Scene.project_id == project_id, Scene.index == scene_index).first()
    if not scene or not scene.frame_path:
        raise HTTPException(status_code=404, detail="Frame not found")
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user.id).first()
    if not project:
        raise HTTPException(status_code=403)
    path = Path(scene.frame_path)
    if not path.exists():
        raise HTTPException(status_code=404)
    return FileResponse(path, media_type="image/png")


@router.get("/projects/{project_id}/scenes/{scene_index}/clip")
def serve_clip(project_id: int, scene_index: int, db=Depends(get_db), user=Depends(get_current_user)):
    scene = db.query(Scene).filter(Scene.project_id == project_id, Scene.index == scene_index).first()
    if not scene or not scene.clip_path:
        raise HTTPException(status_code=404, detail="Clip not found")
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user.id).first()
    if not project:
        raise HTTPException(status_code=403)
    path = Path(scene.clip_path)
    if not path.exists():
        raise HTTPException(status_code=404)
    return FileResponse(path, media_type="video/mp4")
