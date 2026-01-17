import base64
import os
import uuid
from typing import Tuple

import boto3

from app.config import settings

class StorageError(RuntimeError):
    pass

def _parse_data_url(data_url: str) -> Tuple[bytes, str]:
    if "," not in data_url:
        raise StorageError("Invalid data URL")
    header, b64 = data_url.split(",", 1)
    ext = "jpg"
    if "/" in header:
        mime = header.split(";")[0].replace("data:", "")
        ext = mime.split("/")[-1] if "/" in mime else "jpg"
    try:
        raw = base64.b64decode(b64, validate=True)
    except Exception as exc:
        raise StorageError("Invalid base64 image") from exc
    return raw, ext

def save_data_url(data_url: str, folder: str) -> str:
    if settings.storage_backend != "local":
        raise StorageError("Storage backend not implemented")

    raw, ext = _parse_data_url(data_url)
    os.makedirs(folder, exist_ok=True)
    filename = f"{uuid.uuid4().hex}.{ext}"
    full_path = os.path.join(folder, filename)
    with open(full_path, "wb") as f:
        f.write(raw)

    if settings.storage_public_base_url:
        rel_path = os.path.relpath(full_path, settings.storage_dir).replace("\\", "/")
        return f"{settings.storage_public_base_url.rstrip('/')}/{rel_path}"

    return full_path

def _build_public_url(key: str) -> str:
    if settings.aws_public_base_url:
        return f"{settings.aws_public_base_url.rstrip('/')}/{key}"
    if settings.aws_s3_endpoint_url:
        base = settings.aws_s3_endpoint_url.rstrip("/")
        return f"{base}/{settings.aws_s3_bucket}/{key}"
    region = settings.aws_region or "us-east-1"
    if region == "us-east-1":
        return f"https://{settings.aws_s3_bucket}.s3.amazonaws.com/{key}"
    return f"https://{settings.aws_s3_bucket}.s3.{region}.amazonaws.com/{key}"

def create_presigned_put_url(key: str, content_type: str | None) -> dict:
    if settings.storage_backend != "s3":
        raise StorageError("Storage backend not implemented")
    if not settings.aws_s3_bucket:
        raise StorageError("AWS_S3_BUCKET nao configurado")

    client = boto3.client(
        "s3",
        region_name=settings.aws_region or None,
        endpoint_url=settings.aws_s3_endpoint_url or None,
    )
    params = {
        "Bucket": settings.aws_s3_bucket,
        "Key": key,
        "ContentType": content_type or "application/octet-stream",
    }
    if settings.aws_s3_acl:
        params["ACL"] = settings.aws_s3_acl

    url = client.generate_presigned_url(
        "put_object",
        Params=params,
        ExpiresIn=settings.aws_s3_presign_ttl,
        HttpMethod="PUT",
    )
    return {
        "upload_url": url,
        "object_key": key,
        "public_url": _build_public_url(key),
    }
