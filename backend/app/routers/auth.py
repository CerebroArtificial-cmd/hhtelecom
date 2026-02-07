from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app import models
from app.auth import create_access_token, create_user, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterIn(BaseModel):
    username: str
    password: str


class LoginIn(BaseModel):
    username: str
    password: str


@router.post("/register")
def register(payload: RegisterIn, db: Session = Depends(get_db)):
    username = payload.username.strip()
    if not username or not payload.password:
        raise HTTPException(status_code=400, detail="Usuario e senha obrigatorios")
    exists = db.query(models.User).filter(models.User.username == username).first()
    if exists:
        raise HTTPException(status_code=409, detail="Usuario ja existe")
    user = create_user(db, username, payload.password)
    token = create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer", "user_id": user.id}


@router.post("/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    username = payload.username.strip()
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciais invalidas")
    token = create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer", "user_id": user.id}
