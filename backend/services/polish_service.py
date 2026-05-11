"""gen4_aleph video-to-video polish pass."""
import httpx
from pathlib import Path
from runwayml import AsyncRunwayML
from config import RUNWAYML_API_SECRET, OUTPUTS_DIR


async def polish_clip(clip_path: Path, polish_prompt: str, project_id: int, scene_index: int) -> Path:
    """Run a clip through gen4_aleph for style/quality polish."""
    # Upload clip first
    async with AsyncRunwayML(api_key=RUNWAYML_API_SECRET) as client:
        with open(clip_path, "rb") as f:
            upload = await client.uploads.create_ephemeral(file=f)
        video_uri = upload.uri

        task = await client.video_to_video.create(
            model="gen4_aleph",
            prompt_text=polish_prompt,
            video_uri=video_uri,
            ratio="1280:720",
        )
        result = await task.wait_for_task_output()
        video_url = result.output[0]

    out_dir = OUTPUTS_DIR / str(project_id) / "polished"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"polished_{scene_index:03d}.mp4"
    async with httpx.AsyncClient() as http:
        resp = await http.get(video_url, timeout=120)
        resp.raise_for_status()
        out_path.write_bytes(resp.content)
    return out_path
