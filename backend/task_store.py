"""DB-backed task state — drives SSE progress stream."""
import uuid
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from database import SessionLocal, GenerationTask, Project


def _db() -> Session:
    return SessionLocal()


def create_task(project_id: int, total: int = 0) -> str:
    task_id = str(uuid.uuid4())
    db = _db()
    try:
        task = GenerationTask(id=task_id, project_id=project_id, stage="starting", total=total)
        db.add(task)
        db.query(Project).filter(Project.id == project_id).update({"current_task_id": task_id, "status": "processing"})
        db.commit()
    finally:
        db.close()
    return task_id


def update_task(task_id: str, stage: str, done: int = 0, total: int = 0, msg: str = None):
    db = _db()
    try:
        db.query(GenerationTask).filter(GenerationTask.id == task_id).update(
            {"stage": stage, "done": done, "total": total, "msg": msg, "updated_at": datetime.utcnow()}
        )
        db.commit()
    finally:
        db.close()


def get_task_progress(task_id: str) -> Optional[dict]:
    db = _db()
    try:
        task = db.query(GenerationTask).filter(GenerationTask.id == task_id).first()
        if not task:
            return None
        return {"stage": task.stage, "done": task.done, "total": task.total, "msg": task.msg}
    finally:
        db.close()


def complete_task(task_id: str, project_id: int):
    db = _db()
    try:
        db.query(GenerationTask).filter(GenerationTask.id == task_id).update(
            {"stage": "completed", "updated_at": datetime.utcnow()}
        )
        db.query(Project).filter(Project.id == project_id).update({"status": "completed", "current_task_id": None})
        db.commit()
    finally:
        db.close()


def fail_task(task_id: str, project_id: int, msg: str):
    db = _db()
    try:
        db.query(GenerationTask).filter(GenerationTask.id == task_id).update(
            {"stage": "error", "msg": msg, "updated_at": datetime.utcnow()}
        )
        db.query(Project).filter(Project.id == project_id).update({"status": "error", "current_task_id": None})
        db.commit()
    finally:
        db.close()


def is_task_cancelled(task_id: str) -> bool:
    db = _db()
    try:
        task = db.query(GenerationTask).filter(GenerationTask.id == task_id).first()
        return task is not None and task.stage == "cancelled"
    finally:
        db.close()


def cancel_task(task_id: str, project_id: int):
    db = _db()
    try:
        db.query(GenerationTask).filter(GenerationTask.id == task_id).update({"stage": "cancelled"})
        db.query(Project).filter(Project.id == project_id).update({"status": "pending", "current_task_id": None})
        db.commit()
    finally:
        db.close()


def reconcile_task(project_id: int, stale_after_minutes: int = 30) -> Optional[dict]:
    """Called on page load — cleans up stale tasks, returns live progress or None."""
    db = _db()
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project or not project.current_task_id:
            return None
        task = db.query(GenerationTask).filter(GenerationTask.id == project.current_task_id).first()
        if not task:
            db.query(Project).filter(Project.id == project_id).update({"current_task_id": None})
            db.commit()
            return None
        if task.stage in ("completed", "error", "cancelled"):
            db.query(Project).filter(Project.id == project_id).update({"current_task_id": None})
            db.commit()
            return None
        stale_cutoff = datetime.utcnow() - timedelta(minutes=stale_after_minutes)
        if task.updated_at < stale_cutoff:
            db.query(GenerationTask).filter(GenerationTask.id == task.id).update({"stage": "error", "msg": "Task timed out"})
            db.query(Project).filter(Project.id == project_id).update({"status": "error", "current_task_id": None})
            db.commit()
            return None
        return {"task_id": task.id, "stage": task.stage, "done": task.done, "total": task.total, "msg": task.msg}
    finally:
        db.close()
