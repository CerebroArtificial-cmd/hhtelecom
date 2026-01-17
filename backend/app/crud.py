import os
import uuid
from typing import Any, Dict
from sqlalchemy.orm import Session

from app import models
from app.storage import save_data_url
from app.config import settings

PHOTO_KEYS = ("photosUploads", "photos_uploads")

def _extract_photos(payload: Dict[str, Any]) -> Dict[str, Any]:
    for key in PHOTO_KEYS:
        if key in payload:
            return payload.get(key) or {}
    return {}

def _strip_photos(payload: Dict[str, Any]) -> Dict[str, Any]:
    cleaned = payload.copy()
    for key in PHOTO_KEYS:
        cleaned.pop(key, None)
    return cleaned

def create_relatorio(
    db: Session,
    payload: Dict[str, Any],
    save_photos: bool = True,
    status_override: str | None = None,
) -> models.Relatorio:
    photos = _extract_photos(payload)
    cleaned = _strip_photos(payload)
    relatorio = models.Relatorio(
        id=str(uuid.uuid4()),
        timestamp_iso=payload.get("timestamp_iso"),
        site_id=payload.get("siteId"),
        operadora=payload.get("operadora"),
        cidade=payload.get("cidade"),
        status=status_override if status_override is not None else payload.get("status", "sent"),
        observacoes=payload.get("observacoes"),
        payload=cleaned,
    )
    db.add(relatorio)
    if save_photos:
        _save_photos(db, relatorio, photos)
    db.commit()
    db.refresh(relatorio)
    return relatorio

def update_relatorio(
    db: Session,
    relatorio: models.Relatorio,
    payload: Dict[str, Any],
    replace_photos: bool,
    save_photos: bool = True,
    status_override: str | None = None,
) -> models.Relatorio:
    photos = _extract_photos(payload)
    cleaned = _strip_photos(payload)

    relatorio.timestamp_iso = payload.get("timestamp_iso", relatorio.timestamp_iso)
    relatorio.site_id = payload.get("siteId", relatorio.site_id)
    relatorio.operadora = payload.get("operadora", relatorio.operadora)
    relatorio.cidade = payload.get("cidade", relatorio.cidade)
    relatorio.status = status_override if status_override is not None else payload.get("status", relatorio.status)
    relatorio.observacoes = payload.get("observacoes", relatorio.observacoes)
    relatorio.payload = cleaned

    if save_photos:
        if replace_photos:
            for foto in list(relatorio.fotos):
                db.delete(foto)
        _save_photos(db, relatorio, photos)

    db.commit()
    db.refresh(relatorio)
    return relatorio

def _save_photos(db: Session, relatorio: models.Relatorio, photos: Dict[str, Any]) -> None:
    if not photos:
        return
    base_folder = settings.storage_dir
    rel_folder = os.path.join(base_folder, relatorio.id)
    for categoria, entry in photos.items():
        if not entry:
            continue
        images = entry.get("images") or entry.get("urls") or []
        coords = entry.get("coords") or {}
        for data_url in images:
            if not data_url:
                continue
            if isinstance(data_url, str) and data_url.startswith("data:"):
                path_or_url = save_data_url(data_url, rel_folder)
            else:
                path_or_url = str(data_url)
            foto = models.Foto(
                id=str(uuid.uuid4()),
                relatorio_id=relatorio.id,
                categoria=str(categoria),
                path=path_or_url,
                coords_lat=coords.get("lat"),
                coords_lng=coords.get("lng"),
            )
            db.add(foto)
