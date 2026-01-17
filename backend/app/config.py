import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    database_url: str = os.getenv("DATABASE_URL") or os.getenv("SQLALCHEMY_DATABASE_URL")
    cors_origins: list[str] = os.getenv("CORS_ORIGINS", "").split(",")
    storage_backend: str = os.getenv("STORAGE_BACKEND", "local")
    storage_dir: str = os.getenv("STORAGE_DIR", "./storage")
    storage_public_base_url: str = os.getenv("STORAGE_PUBLIC_BASE_URL", "")
    aws_region: str = os.getenv("AWS_REGION", "us-east-1")
    aws_s3_bucket: str = os.getenv("AWS_S3_BUCKET", "")
    aws_s3_prefix: str = os.getenv("AWS_S3_PREFIX", "relatorios")
    aws_s3_endpoint_url: str = os.getenv("AWS_S3_ENDPOINT_URL", "")
    aws_public_base_url: str = os.getenv("AWS_PUBLIC_BASE_URL", "")
    aws_s3_acl: str = os.getenv("AWS_S3_ACL", "")
    aws_s3_presign_ttl: int = int(os.getenv("AWS_S3_PRESIGN_TTL", "900"))

settings = Settings()
