from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app import models, schemas, crud

router = APIRouter(prefix="/relatorios", tags=["relatorios"])

@router.post("", response_model=schemas.RelatorioOut)
def create_relatorio(payload: dict, db: Session = Depends(get_db)):
    if not payload:
        raise HTTPException(status_code=400, detail="Payload vazio")
    relatorio = crud.create_relatorio(db, payload)
    return _to_relatorio_out(relatorio)

@router.get("", response_model=list[schemas.RelatorioOut])
def list_relatorios(
    site_id: str | None = Query(default=None),
    operadora: str | None = Query(default=None),
    cidade: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    q = db.query(models.Relatorio)
    if site_id:
        q = q.filter(models.Relatorio.site_id == site_id)
    if operadora:
        q = q.filter(models.Relatorio.operadora == operadora)
    if cidade:
        q = q.filter(models.Relatorio.cidade == cidade)
    relatorios = q.order_by(models.Relatorio.created_at.desc()).limit(100).all()
    return [_to_relatorio_out(r) for r in relatorios]

@router.get("/{relatorio_id}", response_model=schemas.RelatorioOut)
def get_relatorio(relatorio_id: str, db: Session = Depends(get_db)):
    relatorio = db.query(models.Relatorio).filter(models.Relatorio.id == relatorio_id).first()
    if not relatorio:
        raise HTTPException(status_code=404, detail="Relatorio nao encontrado")
    return _to_relatorio_out(relatorio)

@router.put("/{relatorio_id}", response_model=schemas.RelatorioOut)
def update_relatorio(
    relatorio_id: str,
    payload: dict,
    replace_photos: bool = Query(default=False),
    db: Session = Depends(get_db)
):
    relatorio = db.query(models.Relatorio).filter(models.Relatorio.id == relatorio_id).first()
    if not relatorio:
        raise HTTPException(status_code=404, detail="Relatorio nao encontrado")
    relatorio = crud.update_relatorio(db, relatorio, payload, replace_photos)
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
