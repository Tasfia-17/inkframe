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

    # List available avatars and pick the first one (or a specific director avatar)
    try:
        avatars = await _runway_get("/avatars")
        avatar_id = avatars["data"][0]["id"] if avatars.get("data") else None
    except Exception:
        avatar_id = None

    # Create realtime session with tool calling for scene regeneration
    session_body = {
        "systemPrompt": DIRECTOR_SYSTEM_PROMPT + f"\n\nProject: '{project.title}'\nStory: {project.story_text[:500]}",
        "tools": [
            {
                "type": "server",
                "name": "regenerate_scene",
                "description": "Regenerate a specific scene with new prompts based on director feedback",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "scene_index": {"type": "integer", "description": "0-based scene index to regenerate"},
                        "new_visual_prompt": {"type": "string", "description": "New visual prompt for the scene"},
                        "new_motion_prompt": {"type": "string", "description": "New camera/motion prompt"},
                        "reason": {"type": "string", "description": "Why this change improves the film"},
                    },
                    "required": ["scene_index", "reason"],
                },
                "url": f"{PUBLIC_URL}/api/director/tool/regenerate",
            }
        ],
    }
    if avatar_id:
        session_body["avatarId"] = avatar_id

    try:
        session = await _runway_post("/realtime_sessions", session_body)
        return {
            "session_id": session.get("id"),
            "session_token": session.get("sessionToken"),
            "avatar_id": avatar_id,
            "livekit_url": session.get("livekitUrl"),
        }
    except Exception as e:
        raise HTTPException(500, f"Failed to create director session: {e}")


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
