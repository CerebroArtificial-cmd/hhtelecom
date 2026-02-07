import os
import uuid
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.db import get_db
from app import models

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "60"))
AUTH_DISABLED = os.getenv("AUTH_DISABLED", "0") == "1"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, password_hash: str) -> bool:
    return pwd_context.verify(plain_password, password_hash)


def create_access_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRES_MINUTES)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    if AUTH_DISABLED:
        user = db.query(models.User).filter(models.User.username == "public").first()
        if not user:
            user = models.User(
                id=str(uuid.uuid4()),
                username="public",
                password_hash="",
                is_active=True,
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Token ausente")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalido")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalido")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Usuario inativo ou inexistente")
    return user


def create_user(db: Session, username: str, password: str) -> models.User:
    user = models.User(
        id=str(uuid.uuid4()),
        username=username,
        password_hash=hash_password(password),
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
