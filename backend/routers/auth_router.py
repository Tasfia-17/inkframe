"""Auth router — register, login, logout, me."""
from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from database import get_db, User
from auth import hash_password, verify_password, create_token, get_current_user
from config import INITIAL_CREDITS, COOKIE_SECURE, COOKIE_SAMESITE, JWT_LIFETIME_SECONDS

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterBody(BaseModel):
    email: EmailStr
    password: str


class LoginBody(BaseModel):
    email: EmailStr
    password: str


@router.post("/register", status_code=201)
def register(body: RegisterBody, response: Response, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=body.email, hashed_password=hash_password(body.password), credits=INITIAL_CREDITS)
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_token(user.id)
    response.set_cookie("access_token", token, httponly=True, secure=COOKIE_SECURE,
                        samesite=COOKIE_SAMESITE, max_age=JWT_LIFETIME_SECONDS)
    return {"id": user.id, "email": user.email, "credits": user.credits}


@router.post("/login")
def login(body: LoginBody, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user.id)
    response.set_cookie("access_token", token, httponly=True, secure=COOKIE_SECURE,
                        samesite=COOKIE_SAMESITE, max_age=JWT_LIFETIME_SECONDS)
    return {"id": user.id, "email": user.email, "credits": user.credits, "is_admin": user.is_admin}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"ok": True}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "credits": user.credits, "is_admin": user.is_admin}
