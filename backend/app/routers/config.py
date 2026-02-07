from fastapi import APIRouter

from app.config import settings

router = APIRouter(prefix="/config", tags=["config"])


@router.get("")
def get_config():
    return {
        "storage_backend": settings.storage_backend,
    }
