"""Runway audio generation — TTS narration + SFX per scene."""
import httpx
from pathlib import Path
from config import OUTPUTS_DIR
from services.runway_client import get_runway_client, get_http_client


async def _download(url: str, path: Path):
    client = await get_http_client()
    resp = await client.get(url, timeout=60)
    resp.raise_for_status()
    path.write_bytes(resp.content)


async def generate_narration(
    narration_text: str,
    project_id: int,
    scene_index: int,
    voice_preset: str = "Rachel",
) -> Path:
    """Text → narration audio via eleven_multilingual_v2."""
    client = await get_runway_client()
    task = await client.text_to_speech.create(
        model="eleven_multilingual_v2",
        prompt_text=narration_text,
        voice={"type": "runway-preset", "preset_id": voice_preset},
    )
    result = await task.wait_for_task_output()

    out_dir = OUTPUTS_DIR / str(project_id) / "audio"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"narration_{scene_index:03d}.mp3"
    await _download(result.output[0], out_path)

    # Apply voice isolation to clean up the audio
    return await isolate_voice(out_path)


async def generate_sfx(sfx_prompt: str, project_id: int, scene_index: int, duration: float = 5.0) -> Path:
    """Text → sound effect via eleven_text_to_sound_v2."""
    client = await get_runway_client()
    task = await client.sound_effect.create(
        model="eleven_text_to_sound_v2",
        prompt_text=sfx_prompt,
        duration=duration,
    )
    result = await task.wait_for_task_output()

    out_dir = OUTPUTS_DIR / str(project_id) / "audio"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"sfx_{scene_index:03d}.mp3"
    await _download(result.output[0], out_path)
    return out_path


async def isolate_voice(audio_path: Path) -> Path:
    """Remove background noise from audio using voice_isolation."""
    client = await get_runway_client()
    with open(audio_path, "rb") as f:
        upload = await client.uploads.create_ephemeral(file=f)

    task = await client.voice_isolation.create(
        model="eleven_voice_isolation",
        audio_uri=upload.uri,
    )
    result = await task.wait_for_task_output()

    clean_path = audio_path.parent / f"{audio_path.stem}_clean.mp3"
    await _download(result.output[0], clean_path)
    return clean_path


async def convert_voice_style(
    audio_path: Path,
    project_id: int,
    scene_index: int,
    target_voice_preset: str,
) -> Path:
    """Convert narration to a different voice style via speech_to_speech.
    
    Useful for: villain voice, elderly narrator, child character, etc.
    target_voice_preset: any ElevenLabs preset voice ID
    """
    client = await get_runway_client()
    with open(audio_path, "rb") as f:
        upload = await client.uploads.create_ephemeral(file=f)

    task = await client.speech_to_speech.create(
        model="eleven_multilingual_sts_v2",
        media={"type": "audio", "uri": upload.uri},
        voice={"type": "runway-preset", "preset_id": target_voice_preset},
    )
    result = await task.wait_for_task_output()

    out_dir = OUTPUTS_DIR / str(project_id) / "audio"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"narration_{scene_index:03d}_converted.mp3"
    await _download(result.output[0], out_path)
    return out_path
