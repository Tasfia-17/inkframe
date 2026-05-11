"""Multi-language dubbing via Runway voice_dubbing API."""
import httpx
from pathlib import Path
from runwayml import AsyncRunwayML
from config import RUNWAYML_API_SECRET, OUTPUTS_DIR
import subprocess


async def dub_video_audio(video_path: Path, target_lang: str, project_id: int) -> Path:
    """Dub video audio to target language, preserving speaker voice."""
    # Extract audio from video
    audio_path = video_path.parent / f"{video_path.stem}_audio.mp3"
    subprocess.run([
        "ffmpeg", "-y", "-i", str(video_path),
        "-vn", "-acodec", "libmp3lame", str(audio_path)
    ], check=True, capture_output=True)
    
    # Upload audio
    async with AsyncRunwayML(api_key=RUNWAYML_API_SECRET) as client:
        with open(audio_path, "rb") as f:
            upload = await client.uploads.create_ephemeral(file=f)
        audio_uri = upload.uri
        
        # Dub audio
        task = await client.voice_dubbing.create(
            model="eleven_voice_dubbing",
            audio_uri=audio_uri,
            target_lang=target_lang,
            drop_background_audio=False,
        )
        result = await task.wait_for_task_output()
        dubbed_audio_url = result.output[0]
    
    # Download dubbed audio
    dubbed_audio_path = video_path.parent / f"{video_path.stem}_dubbed_{target_lang}.mp3"
    async with httpx.AsyncClient() as http:
        resp = await http.get(dubbed_audio_url, timeout=120)
        resp.raise_for_status()
        dubbed_audio_path.write_bytes(resp.content)
    
    # Replace audio in video
    out_path = OUTPUTS_DIR / str(project_id) / f"final_{target_lang}.mp4"
    subprocess.run([
        "ffmpeg", "-y", "-i", str(video_path), "-i", str(dubbed_audio_path),
        "-c:v", "copy", "-c:a", "aac", "-map", "0:v:0", "-map", "1:a:0",
        "-shortest", str(out_path)
    ], check=True, capture_output=True)
    
    return out_path
