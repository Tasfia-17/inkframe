"""Runway API client — image generation + image-to-video."""
import asyncio
import base64
import httpx
from pathlib import Path
from runwayml import AsyncRunwayML, TaskFailedError
from tenacity import retry, stop_after_attempt, wait_exponential_jitter, retry_if_exception_type
from config import RUNWAYML_API_SECRET, VIDEO_RATIO, VIDEO_DURATION, GEN_CONCURRENCY, OUTPUTS_DIR, IMAGE_MODEL

_semaphore = asyncio.Semaphore(GEN_CONCURRENCY)
_runway_client: AsyncRunwayML | None = None
_http_client: httpx.AsyncClient | None = None


async def get_runway_client() -> AsyncRunwayML:
    """Get or create shared Runway client."""
    global _runway_client
    if _runway_client is None:
        _runway_client = AsyncRunwayML(api_key=RUNWAYML_API_SECRET)
    return _runway_client


async def get_http_client() -> httpx.AsyncClient:
    """Get or create shared HTTP client."""
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient(timeout=120)
    return _http_client


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential_jitter(initial=2, max=30),
    retry=retry_if_exception_type((httpx.TimeoutException, httpx.HTTPStatusError)),
    reraise=True,
)
async def _download_with_retry(url: str, path: Path):
    """Download file with retry logic."""
    client = await get_http_client()
    resp = await client.get(url)
    resp.raise_for_status()
    path.write_bytes(resp.content)


def _to_data_uri(path: Path) -> str:
    data = path.read_bytes()
    return f"data:image/png;base64,{base64.b64encode(data).decode()}"


async def generate_frame(
    visual_prompt: str,
    project_id: int,
    scene_index: int,
    style_ref_uri: str | None = None,
    char_ref_uri: str | None = None,
) -> Path:
    """Text → image via Runway gen4_image_turbo. Supports style + character references."""
    async with _semaphore:
        reference_images = []
        prompt = visual_prompt

        if char_ref_uri:
            reference_images.append({"uri": char_ref_uri, "tag": "MainCharacter"})
            prompt = f"@MainCharacter {prompt}"

        if style_ref_uri:
            reference_images.append({"uri": style_ref_uri, "tag": "StyleRef"})
            prompt = f"{prompt}, in the style of @StyleRef"

        client = await get_runway_client()
        kwargs = dict(
            ratio="1280:720",
            prompt_text=prompt,
        )
        if reference_images:
            # gen4_image_turbo: cheapest (2cr) when references provided
            kwargs["model"] = "gen4_image_turbo"
            kwargs["reference_images"] = reference_images
        else:
            # gemini_2.5_flash: faster + same cost (5cr) as gen4_image, no refs needed
            kwargs["model"] = "gemini_2.5_flash"

        task = await client.text_to_image.create(**kwargs)
        result = await task.wait_for_task_output()
        image_url = result.output[0]

    out_dir = OUTPUTS_DIR / str(project_id) / "frames"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"frame_{scene_index:03d}.png"
    await _download_with_retry(image_url, out_path)
    return out_path


async def upload_frame(frame_path: Path) -> str:
    """Upload local image → runway:// URI."""
    client = await get_runway_client()
    with open(frame_path, "rb") as f:
        upload = await client.uploads.create_ephemeral(file=f)
    return upload.uri


async def animate_frame(
    runway_uri: str | None,
    motion_prompt: str,
    project_id: int,
    scene_index: int,
    video_model: str = "gen4_turbo",
    video_ratio: str = "1280:720",
    visual_prompt: str | None = None,
) -> tuple[Path, str]:
    """Image → video (or text → video for gen4.5). Returns (local_path, runway_output_url).
    
    gen4.5 supports pure text-to-video — skips image requirement when no runway_uri provided.
    veo3.1/veo3.1_fast: native audio generation enabled.
    """
    async with _semaphore:
        client = await get_runway_client()
        # Combine visual + motion prompts for richer text-to-video
        combined_prompt = f"{visual_prompt}. {motion_prompt}" if visual_prompt else motion_prompt

        kwargs = dict(
            model=video_model,
            prompt_text=combined_prompt,
            ratio=video_ratio,
            duration=VIDEO_DURATION,
        )

        if video_model in ["veo3.1", "veo3.1_fast"]:
            kwargs["audio"] = True

        # Use correct endpoint: text_to_video when no image, image_to_video when image provided
        if runway_uri:
            kwargs["prompt_image"] = runway_uri
            task = await client.image_to_video.create(**kwargs)
        else:
            task = await client.text_to_video.create(**kwargs)

        result = await task.wait_for_task_output()
        video_url = result.output[0]

    out_dir = OUTPUTS_DIR / str(project_id) / "clips"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"clip_{scene_index:03d}.mp4"
    await _download_with_retry(video_url, out_path)
    return out_path, video_url


async def generate_character_ref(description: str, project_id: int) -> tuple[Path, str]:
    """Feature 6: Generate a character reference image, upload it, return (path, runway_uri)."""
    async with _semaphore:
        client = await get_runway_client()
        task = await client.text_to_image.create(
            model="gen4_image",
            ratio="1280:720",
            prompt_text=f"Character reference sheet: {description}, neutral pose, plain background, full body, cinematic lighting",
        )
        result = await task.wait_for_task_output()
        image_url = result.output[0]

    out_dir = OUTPUTS_DIR / str(project_id)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "character_ref.png"
    await _download_with_retry(image_url, out_path)
    runway_uri = await upload_frame(out_path)
    return out_path, runway_uri


async def get_org_usage() -> dict:
    """Get organization credit usage stats."""
    client = await get_runway_client()
    org = await client.organization.retrieve()
    return {
        "credits_remaining": org.credits_remaining if hasattr(org, "credits_remaining") else None,
        "organization_name": org.name if hasattr(org, "name") else None,
    }
