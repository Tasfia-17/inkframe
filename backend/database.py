from datetime import datetime
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from config import DATABASE_URL, DB_CONNECT_ARGS

engine = create_engine(DATABASE_URL, connect_args=DB_CONNECT_ARGS)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    credits = Column(Integer, default=100)
    created_at = Column(DateTime, default=datetime.utcnow)
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    story_text = Column(Text, nullable=False)
    status = Column(String, default="pending")
    current_task_id = Column(String, nullable=True)
    final_video_path = Column(String, nullable=True)
    scene_count = Column(Integer, default=0)
    # Generation options
    video_model = Column(String, default="gen4_turbo")       # feature 4
    video_ratio = Column(String, default="1280:720")         # aspect ratio
    style_ref_path = Column(String, nullable=True)           # feature 5
    style_ref_runway_uri = Column(String, nullable=True)     # feature 5
    char_ref_path = Column(String, nullable=True)            # feature 6
    char_ref_runway_uri = Column(String, nullable=True)      # feature 6
    enable_narration = Column(Boolean, default=True)         # feature 1
    enable_sfx = Column(Boolean, default=True)               # feature 2
    enable_subtitles = Column(Boolean, default=True)         # subtitles
    enable_polish = Column(Boolean, default=False)           # feature 7
    polish_prompt = Column(String, nullable=True)            # feature 7
    storyboard_pdf_path = Column(String, nullable=True)      # storyboard export
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="projects")
    scenes = relationship("Scene", back_populates="project", cascade="all, delete-orphan", order_by="Scene.index")


class Scene(Base):
    __tablename__ = "scenes"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    index = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    visual_prompt = Column(Text, nullable=True)
    motion_prompt = Column(Text, nullable=True)
    narration_text = Column(Text, nullable=True)     # TTS narration text
    sfx_prompt = Column(Text, nullable=True)         # SFX description
    frame_path = Column(String, nullable=True)
    frame_runway_uri = Column(String, nullable=True)
    clip_path = Column(String, nullable=True)
    polished_clip_path = Column(String, nullable=True)  # after gen4_aleph pass
    narration_path = Column(String, nullable=True)   # TTS audio file
    sfx_path = Column(String, nullable=True)         # SFX audio file
    clip_url = Column(String, nullable=True)
    status = Column(String, default="pending")
    error = Column(Text, nullable=True)
    project = relationship("Project", back_populates="scenes")


class GenerationTask(Base):
    __tablename__ = "generation_tasks"
    id = Column(String, primary_key=True)            # UUID
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True)
    stage = Column(String, default="starting")       # starting|parsing_story|generating_frames|animating_clips|generating_audio|polishing|assembling_video|completed|error|cancelled
    done = Column(Integer, default=0)
    total = Column(Integer, default=0)
    msg = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, index=True)
