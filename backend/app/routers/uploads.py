import os
import re
import uuid
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.storage import create_presigned_put_url, StorageError

router = APIRouter(prefix="/uploads", tags=["uploads"])


class PresignRequest(BaseModel):
    filename: Optional[str] = None
    content_type: Optional[str] = None
    site_id: Optional[str] = None
    draft_id: Optional[str] = None


def _safe_segment(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9._-]+", "-", value).strip("-")
    return cleaned or "unknown"


@router.post("/presign")
def presign_upload(payload: PresignRequest):
    if settings.storage_backend != "s3":
        raise HTTPException(status_code=400, detail="Storage backend nao configurado para s3")

    filename = payload.filename or "upload"
    _, ext = os.path.splitext(filename)
    ext = ext.lstrip(".") or "jpg"

    parts = [settings.aws_s3_prefix or "relatorios"]
    if payload.site_id:
        parts.append(_safe_segment(payload.site_id))
    if payload.draft_id:
        parts.append(_safe_segment(payload.draft_id))
    parts.append(f"{uuid.uuid4().hex}.{ext}")
    key = "/".join(parts)

    try:
        return create_presigned_put_url(key, payload.content_type)
    except StorageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
