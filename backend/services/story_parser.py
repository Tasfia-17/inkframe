"""LLM agent — parses story text into scenes with visual + motion + audio prompts."""
import json
import re
from openai import OpenAI
from config import OPENAI_API_KEY, OPENAI_BASE_URL, LLM_MODEL

_client = OpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL)

SYSTEM_PROMPT = """You are a cinematic director. Given a story or novel excerpt, break it into 4-8 visual scenes for a short film.

For each scene output JSON with:
- "description": 1-2 sentence narrative description
- "visual_prompt": detailed text-to-image prompt (cinematic, lighting, composition, style, mood)
- "motion_prompt": 1-sentence camera/motion instruction (e.g. "slow push in", "pan left", "handheld follow")
- "narration_text": 1-2 sentences of voiceover narration for this scene (spoken by a narrator)
- "sfx_prompt": 3-6 word description of ambient sound/SFX for this scene (e.g. "forest wind rustling leaves", "sword clashing metal sparks", "rain on stone temple")

Return ONLY a JSON array. No markdown, no explanation."""

SHOW_DONT_TELL_PROMPT = """You are a screenplay consultant specializing in visual storytelling.
Rewrite the following story so every emotion is shown through physical action, expression, or environment — never stated directly.
Replace abstract emotion words (sad, angry, happy, scared, nervous, etc.) with concrete visual actions a camera can capture.
Keep the same story beats and characters. Return only the rewritten story text, no explanation."""

STORY_ANALYSIS_PROMPT = """Analyze this story for cinematic potential. Return JSON with:
- "hook_score": 0-10 (how compelling is the opening hook)
- "emotional_arc": string (describe the emotional journey: e.g. "despair → determination → triumph")
- "visual_richness": 0-10 (how visually descriptive and filmable is the story)
- "suspense_score": 0-10 (tension and stakes)
- "overall_score": 0-100
- "tip": one actionable suggestion to improve the story for film (max 15 words)
- "ready": true if overall_score >= 60, false otherwise

Return ONLY valid JSON."""

CONTINUITY_PROMPT = """From this story, extract a continuity object for consistent visual generation. Return JSON with:
- "characters": list of objects with "name" and "appearance" (hair, clothing, build — be specific for image generation)
- "palette": 3-5 word color/mood description (e.g. "warm amber tones, golden hour light")
- "setting_style": visual style descriptor (e.g. "gritty urban realism", "ethereal fantasy forest")
- "time_of_day": dominant lighting condition

Return ONLY valid JSON."""


def _call(messages: list, temperature=0.5, max_tokens=2000) -> str:
    r = _client.chat.completions.create(
        model=LLM_MODEL, messages=messages, temperature=temperature, max_tokens=max_tokens
    )
    return r.choices[0].message.content.strip()


def _parse_json(text: str) -> dict | list:
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return json.loads(text)


def analyze_story(story_text: str) -> dict:
    """Pre-generation story quality check. Returns scores + tip."""
    try:
        text = _call([
            {"role": "system", "content": STORY_ANALYSIS_PROMPT},
            {"role": "user", "content": story_text},
        ])
        return _parse_json(text)
    except Exception:
        return {"overall_score": 70, "ready": True, "tip": "", "emotional_arc": "", "hook_score": 7, "visual_richness": 7, "suspense_score": 7}


def extract_continuity(story_text: str) -> dict:
    """Extract character/palette/style continuity for consistent scene generation."""
    try:
        text = _call([
            {"role": "system", "content": CONTINUITY_PROMPT},
            {"role": "user", "content": story_text},
        ])
        return _parse_json(text)
    except Exception:
        return {}


def show_dont_tell(story_text: str) -> str:
    """Rewrite story replacing emotion words with visual actions."""
    try:
        return _call([
            {"role": "system", "content": SHOW_DONT_TELL_PROMPT},
            {"role": "user", "content": story_text},
        ], temperature=0.7, max_tokens=3000)
    except Exception:
        return story_text  # fallback to original


def parse_story(story_text: str, continuity: dict | None = None) -> list[dict]:
    system = SYSTEM_PROMPT
    if continuity:
        chars = continuity.get("characters", [])
        palette = continuity.get("palette", "")
        style = continuity.get("setting_style", "")
        if chars or palette or style:
            char_desc = "; ".join(f"{c['name']}: {c['appearance']}" for c in chars if c.get("appearance"))
            system += f"\n\nCONTINUITY (apply to ALL scenes):\n- Characters: {char_desc}\n- Color palette: {palette}\n- Visual style: {style}"

    response = _client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": f"Story:\n\n{story_text}"},
        ],
        temperature=0.7,
        max_tokens=4000,
    )
    text = response.choices[0].message.content.strip()
    scenes = _parse_json(text)
    if not isinstance(scenes, list):
        raise ValueError("LLM did not return a JSON array")
    return scenes
