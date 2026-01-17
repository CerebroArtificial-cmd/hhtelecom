from typing import Any, Dict, List, Optional
from pydantic import BaseModel

class FotoOut(BaseModel):
    id: str
    categoria: Optional[str] = None
    url: Optional[str] = None
    coords_lat: Optional[float] = None
    coords_lng: Optional[float] = None

class RelatorioOut(BaseModel):
    id: str
    timestamp_iso: Optional[str] = None
    site_id: Optional[str] = None
    operadora: Optional[str] = None
    cidade: Optional[str] = None
    status: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None
    fotos: List[FotoOut] = []
