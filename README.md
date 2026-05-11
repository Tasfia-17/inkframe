# Inkframe

<div align="center">
  <img src="https://raw.githubusercontent.com/Tasfia-17/inkframe/main/logo.png" alt="Inkframe Logo" width="200"/>

  **An agentic media pipeline that chains 10 Runway APIs to transform any story into a complete short film — narrated, scored, subtitled, and ready to publish.**

  Built for the Runway API Hackathon (May 8–11, 2026)

  ![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)
  ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi&logoColor=white)
  ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=0f172a)
  ![Runway](https://img.shields.io/badge/Runway-10%20APIs-000000?style=flat)
</div>

---

## What It Does

Paste a story. Get a downloadable MP4 with voiceover, ambient sound effects, burned-in subtitles, and cinematic color grading. **No video editing. No manual steps. No production team.**

```
Input:  Any story text (novel excerpt, script, creative brief)
Output: Narrated, scored, subtitled MP4 — ready for YouTube, TikTok, or Reels
Time:   60–90 seconds for a 4-scene film
```

---

## The Pipeline — 10 Runway APIs, 8 Stages

Not a single API call. A full agentic pipeline where each stage feeds the next.

```
Story Text
    │
    ▼
[Stage 1] Story Intelligence Layer (LLM)
    │  • Show-Don't-Tell rewrite (emotion words → visual actions)
    │  • Continuity extraction (characters, palette, visual style)
    │  • Scene breakdown into 4–8 cinematic scenes
    │  • Live story quality score (hook, visual richness, suspense)
    │
    ▼
[Stage 2] Storyboard Generation
    │  • Runway gen4_image_turbo → one frame per scene (10× faster than gen4_image)
    │  • Supports style reference + character reference images via @Tag syntax
    │  • gen4.5 mode: skips this stage entirely (pure text-to-video)
    │
    ▼
[Stage 3] Animation (parallel across all scenes)
    │  • Runway image_to_video → 5-second clip per scene
    │  • Model choice: gen4_turbo / gen4.5 / veo3.1 / veo3.1_fast / gen3a_turbo
    │  • veo3.1: native synchronized audio generation enabled
    │
    ▼
[Stage 4] Audio Generation (parallel)
    │  • Runway eleven_multilingual_v2 → per-scene narration (6 voice presets)
    │  • Runway eleven_text_to_sound_v2 → ambient SFX per scene
    │  • Runway eleven_voice_isolation → clean narration audio
    │  • Runway eleven_multilingual_sts_v2 → optional voice style conversion
    │
    ▼
[Stage 5] Cinematic Polish (optional)
    │  • Runway gen4_aleph video-to-video → color grade + film grain
    │
    ▼
[Stage 6] Subtitle Generation
    │  • SRT file from narration text, burned into video via ffmpeg
    │
    ▼
[Stage 7] Assembly
    │  • ffmpeg: narration (100%) + SFX (30%) mixed per scene, then concatenated
    │
    ▼
[Stage 8] Export
       • Download MP4
       • Storyboard PDF
       • 29-language dubbed version (Runway eleven_voice_dubbing)
       • Real-time SSE progress throughout all stages
```

---

## Runway APIs Used

| # | API | Model | Purpose |
|---|-----|-------|---------|
| 1 | `text_to_image` | `gen4_image_turbo` | Storyboard frames — supports @Tag references |
| 2 | `text_to_image` | `gemini_2.5_flash` | Faster frames when no references needed |
| 3 | `image_to_video` | `gen4_turbo`, `gen4.5`, `veo3.1`, `veo3.1_fast`, `seedance2` | Animate frames → clips |
| 4 | `text_to_video` | `gen4.5` | Direct text-to-video, skips frame stage |
| 5 | `text_to_speech` | `eleven_multilingual_v2` | Per-scene narration voiceover |
| 6 | `sound_effect` | `eleven_text_to_sound_v2` | Ambient SFX per scene |
| 7 | `voice_isolation` | `eleven_voice_isolation` | Clean narration audio |
| 8 | `speech_to_speech` | `eleven_multilingual_sts_v2` | Voice style conversion |
| 9 | `video_to_video` | `gen4_aleph` | Cinematic polish pass |
| 10 | `voice_dubbing` | `eleven_voice_dubbing` | 29-language export |
| + | `realtime_sessions` | `gwm1_avatars` | AI Director live video call |
| + | `organization.retrieve` | — | Live credit tracking |

---

## Story Intelligence Layer

Before any media is generated, the story goes through 3 LLM passes:

**1. Show-Don't-Tell Rewrite**
Replaces abstract emotion words ("she was sad", "he felt angry") with concrete visual actions a camera can capture ("she pressed her palm flat against the cold window", "his jaw tightened, knuckles white on the door frame"). Better input → better visual prompts → better film.

**2. Continuity Extraction**
Extracts character appearances, color palette, and visual style from the story and injects them into every scene's generation prompt. Prevents character drift between frames — the same character looks consistent across all scenes.

**3. Live Story Quality Score**
Shown in real-time as you type (debounced). Scores hook strength, visual richness, and suspense (0–10 each) with an overall 0–100 score, emotional arc description, and one actionable tip.

---

## Features

| Feature | Details |
|---------|---------|
| **5 video models** | gen4_turbo (fast), gen4.5 (best quality + text-to-video), veo3.1 (Google premium), veo3.1_fast, gen3a_turbo (budget) |
| **6 narrator voices** | Rachel, Adam, Bella, Antoni, Elli, Josh — selectable per project |
| **Aspect ratios** | 16:9 (YouTube/web) or 9:16 (TikTok/Reels) |
| **Style reference** | Upload any image → all scenes match that visual style |
| **Character reference** | Upload or auto-generate → consistent character across all scenes |
| **Cinematic polish** | Optional gen4_aleph pass with custom style prompt |
| **Subtitles** | Auto-generated SRT, burned into video |
| **29-language dubbing** | One-click export in Spanish, French, Chinese, Japanese, Arabic, and 24 more |
| **Storyboard PDF** | Export all frames for pre-production review |
| **Scene editing** | Edit visual/motion/narration/SFX prompts before or after generation |
| **AI Director** | Runway Characters API (GWM-1) for interactive scene editing |
| **Real-time progress** | SSE stream with stage labels and per-scene status |
| **Cancel mid-generation** | Stop any running pipeline |

---

## Tech Stack

**Backend**
- FastAPI + Uvicorn
- SQLAlchemy (SQLite dev / PostgreSQL prod)
- Runway Python SDK
- OpenAI SDK (GPT-5.5 via OpenRouter)
- ffmpeg (async subprocess)
- Tenacity (retry + exponential backoff)

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS
- Server-Sent Events (real-time progress)

**Architecture**
- Shared Runway client singleton — eliminates repeated auth handshakes
- Shared HTTP client — connection pooling for all downloads
- Async parallel generation — all scenes generated concurrently
- DB-backed task state — survives server restarts
- Exponential backoff with jitter — 3 retry attempts per API call

---

## Setup

### Prerequisites
- Python 3.10+, Node.js 18+, ffmpeg
- [Runway API key](https://dev.runwayml.com)
- OpenAI or OpenRouter API key

### Install & Run

```bash
git clone https://github.com/Tasfia-17/inkframe.git
cd inkframe

# Backend
cd backend
pip install -r requirements.txt
cp ../.env.example ../.env
# Fill in RUNWAYML_API_SECRET and OPENAI_API_KEY in .env
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev
# → http://localhost:5173
```

### Environment Variables

```bash
# Required
RUNWAYML_API_SECRET=your_runway_key
OPENAI_API_KEY=your_openai_or_openrouter_key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=openai/gpt-5.5

# Runway models (defaults)
IMAGE_MODEL=gen4_image_turbo
VIDEO_MODEL=gen4_turbo
VIDEO_DURATION=5
VIDEO_RATIO=1280:720
GEN_CONCURRENCY=3

# Auth
SECRET_KEY=change-me-to-random-32-char-string

# Task queue (inline = no Redis needed)
RUN_TASKS_INLINE=true

# CORS
CORS_ORIGINS=http://localhost:5173
```

---

## API Reference

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

POST   /api/projects/analyze-story      ← live story quality score
POST   /api/projects                    ← create project
GET    /api/projects                    ← list projects
GET    /api/projects/:id                ← project + scenes
PATCH  /api/projects/:id/scenes/:index  ← edit scene prompts
POST   /api/projects/:id/style-ref      ← upload style reference
POST   /api/projects/:id/char-ref       ← upload character reference
POST   /api/projects/:id/generate       ← start pipeline
POST   /api/projects/:id/cancel
GET    /api/projects/:id/task-status
DELETE /api/projects/:id

GET    /api/progress/:task_id           ← SSE progress stream
GET    /api/projects/:id/video          ← download MP4
GET    /api/projects/:id/storyboard-pdf ← download PDF
POST   /api/projects/:id/dub            ← dub to language

POST   /api/director/start              ← Runway Characters session
DELETE /api/director/session/:id

GET    /api/projects/usage              ← Runway credit balance
```

---

## Project Structure

```
inkframe/
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── database.py              — User, Project, Scene, GenerationTask models
│   ├── auth.py                  — JWT authentication
│   ├── task_store.py            — DB-backed task state + SSE
│   ├── routers/
│   │   ├── projects.py          — CRUD + generation + story analysis
│   │   ├── stream.py            — SSE progress + file serving
│   │   ├── auth_router.py
│   │   └── director.py          — Runway Characters API
│   └── services/
│       ├── story_parser.py      — Show-don't-tell, continuity, scene parsing, story scoring
│       ├── runway_client.py     — Shared Runway client, image/video generation
│       ├── audio_service.py     — TTS, SFX, voice isolation, speech-to-speech
│       ├── polish_service.py    — gen4_aleph video-to-video
│       ├── assembler.py         — ffmpeg assembly + subtitles
│       ├── pipeline.py          — 8-stage orchestration
│       ├── storyboard_export.py — PDF generation
│       └── dubbing_service.py   — Multi-language dubbing
└── frontend/
    └── src/
        ├── pages/
        │   ├── HomePage.tsx     — Project grid + story analysis panel + create form
        │   ├── ProjectPage.tsx  — Scene timeline + preview + director panel
        │   ├── LoginPage.tsx
        │   └── RegisterPage.tsx
        ├── hooks/useSSEProgress.ts
        ├── contexts/AuthContext.tsx
        └── utils/api.ts
```

---

## Built For

**Runway API Hackathon** — May 8–11, 2026

Submission by Tasfia Chowdhury · [GitHub](https://github.com/Tasfia-17/inkframe) · rifatasfiachowdhury@gmail.com
