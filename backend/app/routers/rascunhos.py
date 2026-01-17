from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app import models, schemas, crud

router = APIRouter(prefix="/rascunhos", tags=["rascunhos"])


@router.post("", response_model=schemas.RelatorioOut)
def create_rascunho(payload: dict, db: Session = Depends(get_db)):
    if not payload:
        raise HTTPException(status_code=400, detail="Payload vazio")
    payload = dict(payload)
    payload["status"] = "draft"
    relatorio = crud.create_relatorio(db, payload, save_photos=False, status_override="draft")
    return _to_relatorio_out(relatorio)


@router.put("/{relatorio_id}", response_model=schemas.RelatorioOut)
def update_rascunho(
    relatorio_id: str,
    payload: dict,
    replace_photos: bool = Query(default=True),
    db: Session = Depends(get_db),
):
    relatorio = db.query(models.Relatorio).filter(models.Relatorio.id == relatorio_id).first()
    if not relatorio:
        raise HTTPException(status_code=404, detail="Relatorio nao encontrado")
    payload = dict(payload)
    payload["status"] = "draft"
    relatorio = crud.update_relatorio(
        db,
        relatorio,
        payload,
        replace_photos=replace_photos,
        save_photos=False,
        status_override="draft",
    )
    return _to_relatorio_out(relatorio)


@router.get("/ultimo", response_model=schemas.RelatorioOut)
def get_ultimo_rascunho(
    site_id: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    q = db.query(models.Relatorio).filter(models.Relatorio.status == "draft")
    if site_id:
        q = q.filter(models.Relatorio.site_id == site_id)
    relatorio = q.order_by(models.Relatorio.updated_at.desc()).first()
    if not relatorio:
        raise HTTPException(status_code=404, detail="Rascunho nao encontrado")
    return _to_relatorio_out(relatorio)


def _to_relatorio_out(relatorio: models.Relatorio) -> schemas.RelatorioOut:
    fotos = [
        schemas.FotoOut(
            id=f.id,
            categoria=f.categoria,
            url=f.path,
            coords_lat=float(f.coords_lat) if f.coords_lat is not None else None,
            coords_lng=float(f.coords_lng) if f.coords_lng is not None else None,
        )
        for f in relatorio.fotos
    ]
    return schemas.RelatorioOut(
        id=relatorio.id,
        timestamp_iso=relatorio.timestamp_iso,
        site_id=relatorio.site_id,
        operadora=relatorio.operadora,
        cidade=relatorio.cidade,
        status=relatorio.status,
        payload=relatorio.payload,
        fotos=fotos,
    )
