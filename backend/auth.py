from datetime import datetime, timedelta
from typing import Optional
import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db, User
from config import SECRET_KEY, JWT_LIFETIME_SECONDS

bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: int) -> str:
    payload = {"sub": str(user_id), "exp": datetime.utcnow() + timedelta(seconds=JWT_LIFETIME_SECONDS)}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def decode_token(token: str) -> Optional[int]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return int(payload["sub"])
    except Exception:
        return None


def _get_token(request: Request, credentials: Optional[HTTPAuthorizationCredentials]) -> Optional[str]:
    if credentials:
        return credentials.credentials
    return request.cookies.get("access_token")


def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    token = _get_token(request, credentials)
    user_id = decode_token(token) if token else None
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def get_current_user_optional(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    db: Session = Depends(get_db),
) -> Optional[User]:
    token = _get_token(request, credentials)
    user_id = decode_token(token) if token else None
    if not user_id:
        return None
    return db.query(User).filter(User.id == user_id).first()


def require_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin required")
    return user
