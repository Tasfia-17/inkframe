"""Feature 8: Interactive Story Director via Runway Characters API."""
import asyncio
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import get_db, Project
from auth import get_current_user
from config import RUNWAYML_API_SECRET
from runwayml import AsyncRunwayML

router = APIRouter(prefix="/api/director", tags=["director"])

RUNWAY_BASE = "https://api.dev.runwayml.com/v1"
RUNWAY_VERSION = "2024-11-06"

DIRECTOR_SYSTEM_PROMPT = """You are Alex, an experienced film director helping a user create a short film from their story.
You have access to the project's scenes and can regenerate specific scenes based on the user's feedback.
Be creative, encouraging, and specific with your cinematic suggestions.
When the user asks to change a scene, use the regenerate_scene tool."""


class StartDirectorBody(BaseModel):
    project_id: int


@router.post("/start")
async def start_director_session(body: StartDirectorBody, db=Depends(get_db), user=Depends(get_current_user)):
    """Create a Runway realtime session with the director avatar."""
    project = db.query(Project).filter(Project.id == body.project_id, Project.user_id == user.id).first()
    if not project:
        raise HTTPException(404, "Project not found")

    async with AsyncRunwayML(api_key=RUNWAYML_API_SECRET) as client:
        # Get first available avatar — must be a UUID from your Runway account
        try:
            avatars = await client.avatars.list(limit=10)
            if not avatars.data:
                raise HTTPException(400, "No avatars found. Create one at https://dev.runwayml.com → Characters tab.")
            avatar_id = avatars.data[0].id
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(500, f"Failed to list avatars: {e}")

        # Create session
        try:
            session = await client.realtime_sessions.create(
                model="gwm1_avatars",
                avatar={"type": "custom", "avatarId": avatar_id},
                personality=DIRECTOR_SYSTEM_PROMPT + f"\n\nProject: '{project.title}'\nStory: {project.story_text[:500]}",
            )
            session_id = session.id
        except Exception as e:
            raise HTTPException(500, f"Failed to create director session: {e}")

        # Poll until READY (up to 60s)
        session_key = None
        for _ in range(60):
            s = await client.realtime_sessions.retrieve(session_id)
            if s.status == "READY":
                session_key = s.session_key
                break
            if s.status == "FAILED":
                raise HTTPException(500, f"Session failed: {s.failure}")
            await asyncio.sleep(1)

        if not session_key:
            raise HTTPException(504, "Director session timed out")

        # Consume credentials — POST with empty body, auth is sessionKey
        async with httpx.AsyncClient() as http:
            r = await http.post(
                f"{client.base_url}v1/realtime_sessions/{session_id}/consume",
                headers={
                    "Authorization": f"Bearer {session_key}",
                    "X-Runway-Version": RUNWAY_VERSION,
                    "Content-Type": "application/json",
                },
                content=b"{}",
                timeout=15,
            )
            if not r.is_success:
                raise HTTPException(500, f"Consume failed ({r.status_code}): {r.text}")
            credentials = r.json()

    return {
        "session_id": session_id,
        "server_url": credentials.get("url"),
        "token": credentials.get("token"),
        "room_name": credentials.get("roomName"),
    }


@router.delete("/session/{session_id}")
async def end_director_session(session_id: str, user=Depends(get_current_user)):
    """End a director session."""
    try:
        async with AsyncRunwayML(api_key=RUNWAYML_API_SECRET) as client:
            await client.realtime_sessions.delete(session_id)
    except Exception:
        pass
    return {"ok": True}


class ToolCallBody(BaseModel):
    project_id: int
    scene_index: int
    new_visual_prompt: str | None = None
    new_motion_prompt: str | None = None
    reason: str = ""


@router.post("/tool/regenerate")
async def tool_regenerate_scene(body: ToolCallBody, db=Depends(get_db)):
    """Server tool called by the Runway Character to regenerate a scene."""
    from database import Scene
    scene = db.query(Scene).filter(Scene.project_id == body.project_id, Scene.index == body.scene_index).first()
    if not scene:
        return {"success": False, "message": "Scene not found"}

    updates = {"status": "pending"}
    if body.new_visual_prompt:
        updates["visual_prompt"] = body.new_visual_prompt
    if body.new_motion_prompt:
        updates["motion_prompt"] = body.new_motion_prompt

    db.query(Scene).filter(Scene.id == scene.id).update(updates)
    db.commit()

    return {
        "success": True,
        "message": f"Scene {body.scene_index + 1} updated. {body.reason}. Click 'Regenerate Scene' to apply.",
        "scene_index": body.scene_index,
    }
