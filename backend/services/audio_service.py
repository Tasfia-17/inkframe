"""Runway audio generation — TTS narration + SFX per scene."""
import httpx
from pathlib import Path
from runwayml import AsyncRunwayML
from config import RUNWAYML_API_SECRET, OUTPUTS_DIR


async def generate_narration(narration_text: str, project_id: int, scene_index: int) -> Path:
    """Text → narration audio via eleven_multilingual_v2."""
    async with AsyncRunwayML(api_key=RUNWAYML_API_SECRET) as client:
        task = await client.text_to_speech.create(
            model="eleven_multilingual_v2",
            prompt_text=narration_text,
            voice={"type": "runway-preset", "preset_id": "Rachel"},
        )
        result = await task.wait_for_task_output()
        audio_url = result.output[0]

    out_dir = OUTPUTS_DIR / str(project_id) / "audio"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"narration_{scene_index:03d}.mp3"
    async with httpx.AsyncClient() as http:
        resp = await http.get(audio_url, timeout=60)
        resp.raise_for_status()
        out_path.write_bytes(resp.content)
    
    # Apply voice isolation to clean up the audio
    out_path = await isolate_voice(out_path)
    return out_path


async def generate_sfx(sfx_prompt: str, project_id: int, scene_index: int, duration: float = 5.0) -> Path:
    """Text → sound effect via eleven_text_to_sound_v2."""
    async with AsyncRunwayML(api_key=RUNWAYML_API_SECRET) as client:
        task = await client.sound_effect.create(
            model="eleven_text_to_sound_v2",
            prompt_text=sfx_prompt,
            duration=duration,
        )
        result = await task.wait_for_task_output()
        audio_url = result.output[0]

    out_dir = OUTPUTS_DIR / str(project_id) / "audio"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"sfx_{scene_index:03d}.mp3"
    async with httpx.AsyncClient() as http:
        resp = await http.get(audio_url, timeout=60)
        resp.raise_for_status()
        out_path.write_bytes(resp.content)
    return out_path


async def isolate_voice(audio_path: Path) -> Path:
    """Remove background noise from audio using voice_isolation."""
    async with AsyncRunwayML(api_key=RUNWAYML_API_SECRET) as client:
        # Upload audio
        with open(audio_path, "rb") as f:
            upload = await client.uploads.create_ephemeral(file=f)
        audio_uri = upload.uri
        
        # Isolate voice
        task = await client.voice_isolation.create(
            model="eleven_voice_isolation",
            audio_uri=audio_uri,
        )
        result = await task.wait_for_task_output()
        clean_audio_url = result.output[0]
    
    # Download cleaned audio
    clean_path = audio_path.parent / f"{audio_path.stem}_clean.mp3"
    async with httpx.AsyncClient() as http:
        resp = await http.get(clean_audio_url, timeout=60)
        resp.raise_for_status()
        clean_path.write_bytes(resp.content)
    
    return clean_path

