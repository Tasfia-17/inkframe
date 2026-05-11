"""Feature 8: Interactive Story Director via Runway Characters API.
Creates a realtime session with a Runway avatar that acts as a film director.
The avatar can trigger scene regeneration via tool calling.
"""
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from database import get_db, Project
from auth import get_current_user
from config import RUNWAYML_API_SECRET
import os

PUBLIC_URL = os.getenv("PUBLIC_URL", "http://localhost:8000")

router = APIRouter(prefix="/api/director", tags=["director"])

RUNWAY_API = "https://api.dev.runwayml.com/v1"
HEADERS = {
    "Authorization": f"Bearer {RUNWAYML_API_SECRET}",
    "X-Runway-Version": "2024-11-06",
    "Content-Type": "application/json",
}

DIRECTOR_SYSTEM_PROMPT = """You are Alex, an experienced film director helping a user create a short film from their story.
You have access to the project's scenes and can regenerate specific scenes based on the user's feedback.
Be creative, encouraging, and specific with your cinematic suggestions.
When the user asks to change a scene, use the regenerate_scene tool."""


async def _runway_post(path: str, body: dict) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.post(f"{RUNWAY_API}{path}", headers=HEADERS, json=body, timeout=30)
        r.raise_for_status()
        return r.json()


async def _runway_get(path: str) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{RUNWAY_API}{path}", headers=HEADERS, timeout=30)
        r.raise_for_status()
        return r.json()


class StartDirectorBody(BaseModel):
    project_id: int


@router.post("/start")
async def start_director_session(body: StartDirectorBody, db=Depends(get_db), user=Depends(get_current_user)):
    """Create a Runway realtime session with the director avatar."""
    project = db.query(Project).filter(Project.id == body.project_id, Project.user_id == user.id).first()
    if not project:
        raise HTTPException(404, "Project not found")

    # List available avatars and pick the first preset one
    try:
        avatars_resp = await _runway_get("/avatars")
        avatar_id = avatars_resp["data"][0]["id"] if avatars_resp.get("data") else "customer-service"
    except Exception:
        avatar_id = "customer-service"

    # Step 1: Create session with correct schema
    session_body = {
        "model": "gwm1_avatars",
        "avatar": {"type": "custom", "avatarId": avatar_id},
        "personality": DIRECTOR_SYSTEM_PROMPT + f"\n\nProject: '{project.title}'\nStory: {project.story_text[:500]}",
    }

    try:
        session = await _runway_post("/realtime_sessions", session_body)
        session_id = session["id"]
    except Exception as e:
        raise HTTPException(500, f"Failed to create director session: {e}")

    # Step 2: Poll until READY (up to 60s)
    session_key = None
    async with httpx.AsyncClient() as client:
        for _ in range(60):
            r = await client.get(f"{RUNWAY_API}/realtime_sessions/{session_id}", headers=HEADERS, timeout=10)
            data = r.json()
            if data.get("status") == "READY":
                session_key = data.get("sessionKey")
                break
            if data.get("status") == "FAILED":
                raise HTTPException(500, f"Session failed: {data.get('failure')}")
            import asyncio
            await asyncio.sleep(1)

    if not session_key:
        raise HTTPException(504, "Director session timed out")

    # Step 3: Consume session to get LiveKit credentials
    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"{RUNWAY_API}/realtime_sessions/{session_id}/consume",
            headers={**HEADERS, "Authorization": f"Bearer {session_key}"},
            timeout=15,
        )
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
        async with httpx.AsyncClient() as client:
            r = await client.delete(f"{RUNWAY_API}/realtime_sessions/{session_id}", headers=HEADERS, timeout=15)
        return {"ok": True}
    except Exception:
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
