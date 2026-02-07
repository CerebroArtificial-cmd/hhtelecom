import os
import re
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.db import get_db
from app import models
from app.auth import get_current_user
from app.storage import create_presigned_get_url, create_presigned_post, StorageError

router = APIRouter(prefix="/uploads", tags=["uploads"])


class PresignRequest(BaseModel):
    filename: Optional[str] = None
    content_type: Optional[str] = None
    size_bytes: Optional[int] = None
    site_id: Optional[str] = None
    draft_id: Optional[str] = None
    visita_id: Optional[str] = None
    categoria: Optional[str] = None
    campo_key: Optional[str] = None


class PresignGetRequest(BaseModel):
    object_key: str
    visita_id: str


def _safe_segment(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9._-]+", "-", value).strip("-")
    return cleaned or "unknown"


@router.post("/presign")
def presign_upload(
    payload: PresignRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if settings.storage_backend != "s3":
        raise HTTPException(status_code=400, detail="Storage backend nao configurado para s3")
    if not payload.visita_id:
        raise HTTPException(status_code=400, detail="visita_id obrigatorio")
    exists = (
        db.query(models.Relatorio)
        .filter(models.Relatorio.id == payload.visita_id, models.Relatorio.user_id == user.id)
        .first()
    )
    if not exists:
        raise HTTPException(status_code=404, detail="visita_id nao encontrado")

    content_type = (payload.content_type or "").strip()
    if not content_type:
        raise HTTPException(status_code=400, detail="content_type obrigatorio")
    if settings.upload_allowed_types and content_type not in settings.upload_allowed_types:
        raise HTTPException(status_code=400, detail="content_type nao permitido")
    if payload.size_bytes is None:
        raise HTTPException(status_code=400, detail="size_bytes obrigatorio")
    if payload.size_bytes > settings.upload_max_bytes:
        raise HTTPException(status_code=400, detail="arquivo excede o tamanho maximo")

    filename = payload.filename or "upload"
    _, ext = os.path.splitext(filename)
    ext = ext.lstrip(".") or "jpg"

    parts = [settings.aws_s3_prefix or "relatorios"]
    if payload.site_id:
        parts.append(_safe_segment(payload.site_id))
    if payload.visita_id:
        parts.append(_safe_segment(payload.visita_id))
    if payload.categoria:
        parts.append(_safe_segment(payload.categoria))
    if payload.campo_key:
        parts.append(_safe_segment(payload.campo_key))
    if payload.draft_id:
        parts.append(_safe_segment(payload.draft_id))
    parts.append(f"{uuid.uuid4().hex}.{ext}")
    key = "/".join(parts)

    try:
        return create_presigned_post(key, payload.content_type, settings.upload_max_bytes)
    except StorageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/presign-download")
def presign_download(
    payload: PresignGetRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    if settings.storage_backend != "s3":
        raise HTTPException(status_code=400, detail="Storage backend nao configurado para s3")

    foto = (
        db.query(models.Foto)
        .join(models.Relatorio, models.Relatorio.id == models.Foto.relatorio_id)
        .filter(
            models.Foto.relatorio_id == payload.visita_id,
            models.Foto.path == payload.object_key,
            models.Relatorio.user_id == user.id,
        )
        .first()
    )
    if not foto:
        raise HTTPException(status_code=404, detail="foto nao encontrada para visita_id")

    try:
        return create_presigned_get_url(payload.object_key)
    except StorageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
