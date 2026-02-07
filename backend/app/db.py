import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

_env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=_env_path)

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("SQLALCHEMY_DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL não encontrada. Verifique o arquivo .env")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

