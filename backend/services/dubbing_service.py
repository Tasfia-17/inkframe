"""Multi-language dubbing via Runway voice_dubbing API."""
import asyncio
import httpx
from pathlib import Path
from runwayml import AsyncRunwayML
from config import RUNWAYML_API_SECRET, OUTPUTS_DIR


async def _run_ffmpeg(*args: str):
    proc = await asyncio.create_subprocess_exec(
        *args,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg error: {stderr.decode()[-500:]}")


async def dub_video_audio(video_path: Path, target_lang: str, project_id: int) -> Path:
    """Dub video audio to target language, preserving speaker voice."""
    audio_path = video_path.parent / f"{video_path.stem}_audio.mp3"
    await _run_ffmpeg(
        "ffmpeg", "-y", "-i", str(video_path),
        "-vn", "-acodec", "libmp3lame", str(audio_path)
    )

    async with AsyncRunwayML(api_key=RUNWAYML_API_SECRET) as client:
        with open(audio_path, "rb") as f:
            upload = await client.uploads.create_ephemeral(file=f)

        task = await client.voice_dubbing.create(
            model="eleven_voice_dubbing",
            audio_uri=upload.uri,
            target_lang=target_lang,
            drop_background_audio=False,
        )
        result = await task.wait_for_task_output()
        dubbed_audio_url = result.output[0]

    dubbed_audio_path = video_path.parent / f"{video_path.stem}_dubbed_{target_lang}.mp3"
    async with httpx.AsyncClient() as http:
        resp = await http.get(dubbed_audio_url, timeout=120)
        resp.raise_for_status()
        dubbed_audio_path.write_bytes(resp.content)

    out_path = OUTPUTS_DIR / str(project_id) / f"final_{target_lang}.mp4"
    await _run_ffmpeg(
        "ffmpeg", "-y", "-i", str(video_path), "-i", str(dubbed_audio_path),
        "-c:v", "copy", "-c:a", "aac", "-map", "0:v:0", "-map", "1:a:0",
        "-shortest", str(out_path)
    )

    return out_path
