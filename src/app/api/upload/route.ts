import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

const bucket = process.env.AWS_S3_BUCKET || "";
const region = process.env.AWS_REGION || "us-east-1";
const prefix = process.env.AWS_S3_PREFIX || "relatorios";
const publicBaseUrl = process.env.AWS_PUBLIC_BASE_URL || "";

function buildPublicUrl(key: string) {
  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\\/$/, "")}/${key}`;
  }
  if (region === "us-east-1") {
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function makeKey(filename: string) {
  const cleanName = filename.replace(/[^a-zA-Z0-9._-]+/g, "-");
  const rand = crypto.randomUUID();
  return `${prefix}/${rand}-${cleanName}`;
}

export async function POST(req: Request) {
  if (!bucket) {
    return NextResponse.json({ error: "AWS_S3_BUCKET nao configurado" }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo nao enviado" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const body = Buffer.from(arrayBuffer);
  const key = makeKey(file.name || "upload");

  const client = new S3Client({ region });
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: file.type || "application/octet-stream",
    })
  );

  return NextResponse.json({ url: buildPublicUrl(key), key });
}
