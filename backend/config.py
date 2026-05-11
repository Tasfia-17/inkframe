import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR.parent / ".env")

ENV = os.getenv("ENV", "development").lower()

# Runway
RUNWAYML_API_SECRET = os.getenv("RUNWAYML_API_SECRET", "")

# LLM (OpenAI-compatible)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o")

# Runway model config
IMAGE_MODEL = os.getenv("IMAGE_MODEL", "gen4_image_turbo")    # 10x faster than gen4_image
VIDEO_MODEL = os.getenv("VIDEO_MODEL", "gen4_turbo")          # 5 credits/sec
VIDEO_DURATION = int(os.getenv("VIDEO_DURATION", "4"))        # seconds per clip (4s = 20% faster, smooth concat)
VIDEO_RATIO = os.getenv("VIDEO_RATIO", "1280:720")
ENABLE_SUBTITLES = os.getenv("ENABLE_SUBTITLES", "true").lower() == "true"

# Generation concurrency
GEN_CONCURRENCY = int(os.getenv("GEN_CONCURRENCY", "5"))      # raised from 3 → 5 for faster parallel gen

# Storage
UPLOADS_DIR = BASE_DIR / "uploads"
OUTPUTS_DIR = BASE_DIR / "outputs"
for d in [UPLOADS_DIR, OUTPUTS_DIR]:
    d.mkdir(exist_ok=True)

# Database
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'app.db'}")
DB_CONNECT_ARGS = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# Auth
SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production-please-use-random-32-chars")
JWT_LIFETIME_SECONDS = int(os.getenv("JWT_LIFETIME_SECONDS", str(60 * 60 * 24 * 7)))
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
COOKIE_SAMESITE = os.getenv("COOKIE_SAMESITE", "lax")

# Redis / RQ
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
TASK_QUEUE_NAME = os.getenv("TASK_QUEUE_NAME", "inkframe")
RUN_TASKS_INLINE = os.getenv("RUN_TASKS_INLINE", "true").lower() == "true"

# CORS
CORS_ORIGINS = [
    o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if o.strip()
]

# Credits
INITIAL_CREDITS = int(os.getenv("INITIAL_CREDITS", "100"))
CREDITS_PER_IMAGE = int(os.getenv("CREDITS_PER_IMAGE", "1"))
CREDITS_PER_VIDEO_SEC = int(os.getenv("CREDITS_PER_VIDEO_SEC", "1"))

RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
