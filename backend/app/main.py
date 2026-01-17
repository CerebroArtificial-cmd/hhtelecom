from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routers.relatorios import router as relatorios_router
from app.routers.rascunhos import router as rascunhos_router
from app.routers.uploads import router as uploads_router
from dotenv import load_dotenv
load_dotenv()


app = FastAPI(title="Relatorio de Visita Externa API")

origins = settings.cors_origins
if origins:
    app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if settings.storage_backend == "local":
    app.mount("/storage", StaticFiles(directory=settings.storage_dir), name="storage")

app.include_router(relatorios_router, prefix="/api")
app.include_router(rascunhos_router, prefix="/api")
app.include_router(uploads_router, prefix="/api")
