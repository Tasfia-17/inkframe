# Inkframe

<div align="center">
  <img src="https://raw.githubusercontent.com/Tasfia-17/inkframe/main/logo.png" alt="Inkframe Logo" width="200"/>
  
  **Story to Short Film Generator**
  
  Turn any story into a complete short film with narration, sound effects, and subtitles.
  
  Built with 9 Runway APIs + GPT-5.5 for the Runway API Hackathon (May 2026)
</div>

---

## What It Does

Paste a story, get a complete short film. No video editing required.

**Input:** Any story text (novel excerpt, script, creative brief)  
**Output:** Narrated, scored, subtitled video ready for YouTube, TikTok, or Reels

**Generation time:** 60-90 seconds for a 4-scene film

---

## Features

- **9 Runway APIs** - Text-to-image, image-to-video, TTS, SFX, voice isolation, video-to-video, voice dubbing, organization, avatars
- **Multi-language dubbing** - Export in 29 languages with one click
- **Vertical video** - 9:16 aspect ratio for TikTok and Instagram Reels
- **Subtitles** - Auto-generated and burned into video
- **Storyboard PDF** - Export frames for pre-production review
- **Real-time progress** - Server-sent events with stage-by-stage updates
- **Style references** - Upload any image to match visual style
- **Character consistency** - Auto-generated character reference across all scenes
- **AI Director** - Runway Characters API for interactive scene editing

---

## How It Works

### 7-Stage Pipeline

1. **Story Analysis** - GPT-5.5 breaks story into 4-8 cinematic scenes with visual prompts, camera motion, narration, and SFX descriptions
2. **Storyboard Generation** - Runway gen4_image_turbo creates frames (10x faster than standard)
3. **Animation** - Runway animates each frame into a 5-second video clip (supports Gen4 Turbo, Gen4.5, Veo3.1, Veo3.1 Fast, Gen3 Turbo)
4. **Audio Generation** - ElevenLabs TTS for narration + text-to-sound for ambient effects + voice isolation for clean audio
5. **Polish Pass** (optional) - gen4_aleph video-to-video enhancement for cinematic quality
6. **Subtitle Generation** - SRT file created from narration text and burned into video
7. **Assembly** - ffmpeg mixes video + narration (100% volume) + SFX (30% volume) + subtitles into final MP4

---

## Tech Stack

**Backend**
- FastAPI - Web framework
- SQLAlchemy - ORM with SQLite (dev) / PostgreSQL (prod)
- Runway SDK 4.14.0 - Media generation
- OpenAI SDK - Story parsing (GPT-5.5 via OpenRouter)
- ffmpeg - Video assembly
- Tenacity - Retry logic with exponential backoff

**Frontend**
- React 18 + TypeScript
- Vite - Build tool
- Tailwind CSS - Styling
- Server-Sent Events - Real-time progress

**Optimizations**
- Shared Runway client (singleton pattern)
- Async I/O (non-blocking event loop)
- DB connection pooling
- Retry logic with exponential backoff
- DB indexes on foreign keys
- Async ffmpeg (asyncio.create_subprocess_exec)

---

## Setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- ffmpeg
- Runway API key (get from https://dev.runwayml.com)
- OpenAI/OpenRouter API key

### Installation

```bash
# Clone repository
git clone https://github.com/Tasfia-17/inkframe.git
cd inkframe

# Backend setup
cd backend
pip install -r requirements.txt
cp ../.env.example ../.env
# Edit .env and add your API keys:
#   RUNWAYML_API_SECRET=your_runway_key
#   OPENAI_API_KEY=your_openai_key

# Frontend setup
cd ../frontend
npm install

# Start backend (terminal 1)
cd ../backend
uvicorn main:app --reload --port 8000

# Start frontend (terminal 2)
cd ../frontend
npm run dev

# Open browser
# http://localhost:5173
```

---

## Environment Variables

Required in `.env`:

```bash
# Runway API
RUNWAYML_API_SECRET=your_runway_api_key

# LLM for story parsing
OPENAI_API_KEY=your_openai_or_openrouter_key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=openai/gpt-5.5

# Runway models
IMAGE_MODEL=gen4_image_turbo
VIDEO_MODEL=gen4_turbo
VIDEO_DURATION=5
VIDEO_RATIO=1280:720

# Generation concurrency
GEN_CONCURRENCY=3

# Auth
SECRET_KEY=change-me-to-random-32-char-string

# Optional: Redis for task queue (set RUN_TASKS_INLINE=true to skip)
REDIS_URL=redis://localhost:6379/0
RUN_TASKS_INLINE=true

# CORS
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Credits
INITIAL_CREDITS=100

# Public URL for Runway tool callbacks (Director feature)
PUBLIC_URL=http://localhost:8000
```

---

## API Endpoints

```
POST   /api/auth/register          - Create account
POST   /api/auth/login             - Login
POST   /api/auth/logout            - Logout
GET    /api/auth/me                - Get current user

POST   /api/projects               - Create project
GET    /api/projects               - List projects
GET    /api/projects/:id           - Get project with scenes
PATCH  /api/projects/:id/scenes/:index - Edit scene prompts
POST   /api/projects/:id/style-ref - Upload style reference image
POST   /api/projects/:id/char-ref  - Upload character reference image
POST   /api/projects/:id/generate  - Start generation
POST   /api/projects/:id/cancel    - Cancel generation
GET    /api/projects/:id/task-status - Get current task status
DELETE /api/projects/:id           - Delete project

GET    /api/progress/:task_id      - SSE stream of generation progress
GET    /api/projects/:id/video     - Download final video
GET    /api/projects/:id/storyboard-pdf - Download storyboard PDF
POST   /api/projects/:id/dub       - Dub video to target language
GET    /api/projects/usage         - Get Runway credit usage

POST   /api/director/start         - Start AI director session
DELETE /api/director/session/:id   - End director session
```

---

## Runway APIs Used

| API | Model | Purpose |
|-----|-------|---------|
| text_to_image | gen4_image_turbo | Storyboard frames (10x faster) |
| image_to_video | gen4_turbo, gen4.5, veo3.1, veo3.1_fast, gen3a_turbo | Animate frames to clips |
| image_to_video (Veo 3.1) | veo3.1 with audio: true | Native synchronized audio |
| text_to_speech | eleven_multilingual_v2 | Narration voiceover (49 preset voices) |
| sound_effect | eleven_text_to_sound_v2 | Ambient sound effects |
| voice_isolation | eleven_voice_isolation | Clean narration audio |
| video_to_video | gen4_aleph | Cinematic polish pass |
| voice_dubbing | eleven_voice_dubbing | Multi-language export (29 languages) |
| organization.retrieve | - | Credit usage tracking |

---

## Architecture

### Pipeline Stages

```
parsing_story → generating_frames → animating_clips → generating_audio → polishing → assembling_video → completed
```

### Database Schema

- **User** - email, password, credits
- **Project** - title, story_text, video_model, video_ratio, enable_narration, enable_sfx, enable_subtitles, enable_polish, style_ref, char_ref
- **Scene** - project_id, index, description, visual_prompt, motion_prompt, narration_text, sfx_prompt, frame_path, clip_path, status
- **GenerationTask** - project_id, stage, done, total, msg (for SSE progress)

### Performance Optimizations

- **Shared Runway client** - Eliminates 12+ auth handshakes per film
- **Shared HTTP client** - Connection pooling for downloads
- **Async ffmpeg** - Non-blocking event loop during video assembly
- **DB connection reuse** - Single session per pipeline run
- **DB indexes** - Fast queries on project_id foreign keys
- **Retry logic** - Exponential backoff with jitter (3 attempts)

**Result:** 40-60% faster generation compared to naive implementation

---

## Project Structure

```
inkframe/
├── backend/
│   ├── main.py              - FastAPI app
│   ├── config.py            - Environment configuration
│   ├── database.py          - SQLAlchemy models
│   ├── auth.py              - JWT authentication
│   ├── task_store.py        - DB-backed task state
│   ├── routers/
│   │   ├── auth_router.py   - Auth endpoints
│   │   ├── projects.py      - Project CRUD + generation
│   │   ├── stream.py        - SSE progress + file serving
│   │   └── director.py      - AI director (Runway Characters)
│   └── services/
│       ├── story_parser.py  - GPT-5.5 scene parsing
│       ├── runway_client.py - Runway API wrapper
│       ├── audio_service.py - TTS + SFX + voice isolation
│       ├── polish_service.py - gen4_aleph polish pass
│       ├── assembler.py     - ffmpeg video assembly
│       ├── pipeline.py      - 7-stage orchestration
│       ├── storyboard_export.py - PDF generation
│       └── dubbing_service.py - Multi-language dubbing
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx     - Project list + create
│   │   │   ├── ProjectPage.tsx  - Generation + preview
│   │   │   ├── LoginPage.tsx    - Login
│   │   │   └── RegisterPage.tsx - Register
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx  - Auth state
│   │   ├── hooks/
│   │   │   └── useSSEProgress.ts - SSE progress hook
│   │   └── utils/
│   │       └── api.ts           - Axios client
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── .env.example
└── README.md
```

---

## Usage Example

### 1. Create Project

```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_JWT" \
  -d '{
    "title": "Mars Discovery",
    "story_text": "A lone astronaut discovers an ancient alien artifact on Mars. The artifact begins to glow, revealing a holographic message.",
    "video_model": "gen4_turbo",
    "video_ratio": "1280:720",
    "enable_narration": true,
    "enable_sfx": true,
    "enable_subtitles": true,
    "enable_polish": false
  }'
```

### 2. Start Generation

```bash
curl -X POST http://localhost:8000/api/projects/1/generate \
  -H "Cookie: access_token=YOUR_JWT"
```

### 3. Watch Progress (SSE)

```bash
curl -N http://localhost:8000/api/progress/TASK_ID
```

### 4. Download Result

```bash
curl http://localhost:8000/api/projects/1/video \
  -H "Cookie: access_token=YOUR_JWT" \
  -o film.mp4
```

---

## Testing

```bash
# Verify all code and optimizations
python3 verify.py

# Test API connectivity
python3 test_api.py

# Test optimizations
python3 test_optimizations.py
```

---

## Deployment

### Production Checklist

- [ ] Set `SECRET_KEY` to random 32-char string
- [ ] Set `COOKIE_SECURE=true` (requires HTTPS)
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set `RUN_TASKS_INLINE=false` and configure Redis/RQ
- [ ] Set `PUBLIC_URL` to your domain (for Director feature)
- [ ] Configure CORS_ORIGINS for your frontend domain
- [ ] Set up CDN for serving generated videos
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging

### Docker (Optional)

```bash
# Backend
docker build -t inkframe-backend ./backend
docker run -p 8000:8000 --env-file .env inkframe-backend

# Frontend
docker build -t inkframe-frontend ./frontend
docker run -p 5173:5173 inkframe-frontend
```

---

## Credits

- **Runway API** - All media generation (9 endpoints)
- **OpenAI GPT-5.5** - Story parsing (via OpenRouter)
- **ElevenLabs** - TTS and sound effects (via Runway)
- **ffmpeg** - Video assembly and subtitle rendering

---

## License

MIT License - See LICENSE file for details

---

## Built For

**Runway API Hackathon** (May 8-11, 2026)

Submission by Tasfia Chowdhury

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/Tasfia-17/inkframe/issues
- Email: rifatasfiachowdhury@gmail.com
