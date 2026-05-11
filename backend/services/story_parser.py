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


def parse_story(story_text: str) -> list[dict]:
    response = _client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Story:\n\n{story_text}"},
        ],
        temperature=0.7,
        max_tokens=4000,
    )
    text = response.choices[0].message.content.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    scenes = json.loads(text)
    if not isinstance(scenes, list):
        raise ValueError("LLM did not return a JSON array")
    return scenes
