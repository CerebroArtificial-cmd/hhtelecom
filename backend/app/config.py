import os
from pathlib import Path
from dotenv import load_dotenv

_env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=_env_path)

class Settings:
    database_url: str = os.getenv("DATABASE_URL") or os.getenv("SQLALCHEMY_DATABASE_URL")
    cors_origins: list[str] = os.getenv("CORS_ORIGINS", "").split(",")
    storage_backend: str = os.getenv("STORAGE_BACKEND", "local")
    storage_dir: str = os.getenv("STORAGE_DIR", "./storage")
    storage_public_base_url: str = os.getenv("STORAGE_PUBLIC_BASE_URL", "")
    api_key: str = os.getenv("API_KEY", "")
    aws_region: str = os.getenv("AWS_REGION", "us-east-1")
    aws_s3_bucket: str = os.getenv("AWS_S3_BUCKET", "")
    aws_s3_prefix: str = os.getenv("AWS_S3_PREFIX", "relatorios")
    aws_s3_endpoint_url: str = os.getenv("AWS_S3_ENDPOINT_URL", "")
    aws_public_base_url: str = os.getenv("AWS_PUBLIC_BASE_URL", "")
    aws_s3_acl: str = os.getenv("AWS_S3_ACL", "")
    aws_s3_presign_ttl: int = int(os.getenv("AWS_S3_PRESIGN_TTL", "900"))
    upload_allowed_types: list[str] = [
        t.strip() for t in os.getenv("UPLOAD_ALLOWED_TYPES", "image/jpeg,image/png").split(",") if t.strip()
    ]
    upload_max_bytes: int = int(os.getenv("UPLOAD_MAX_BYTES", "20971520"))

settings = Settings()
