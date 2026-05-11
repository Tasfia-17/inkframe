from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import init_db
from config import CORS_ORIGINS
from routers.auth_router import router as auth_router
from routers.projects import router as projects_router
from routers.stream import router as stream_router
from routers.director import router as director_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Inkframe API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(stream_router)
app.include_router(director_router)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": str(exc)})


@app.get("/health")
def health():
    return {"status": "ok"}
