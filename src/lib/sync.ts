import { getSupabase, isSupabaseConfigured } from "./supabase";
import {
  getReportsByStatus,
  getPhotosByStatus,
  updateReportStatus,
  updatePhotoStatus,
  OfflinePhoto,
} from "./offlineStore";

const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "photos";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

export async function syncPending(opts?: {
  onProgress?: (done: number, total: number) => void;
}): Promise<{ reports: number; photos: number } | null> {
  if (!isSupabaseConfigured) return null;
  if (typeof navigator !== "undefined" && !navigator.onLine) return null;

  const supabase = getSupabase();
  const pendingReports = await getReportsByStatus("pending");
  const pendingPhotos = await getPhotosByStatus("pending");

  for (const report of pendingReports) {
    const { error } = await supabase.from("reports").upsert({
      id: report.id,
      payload_json: report.payload_json,
      status: report.status,
      created_at: report.created_at,
      updated_at: report.updated_at,
    });
    if (error) {
      console.error("Supabase report upsert error:", error);
    }
  }

  const total = pendingPhotos.length;
  let done = 0;
  const pendingByReport = new Map<string, number>();
  for (const p of pendingPhotos) {
    pendingByReport.set(p.report_id, (pendingByReport.get(p.report_id) || 0) + 1);
  }

  for (const photo of pendingPhotos) {
    const ok = await uploadAndInsertPhoto(supabase, photo);
    if (ok) {
      done += 1;
      const left = (pendingByReport.get(photo.report_id) || 1) - 1;
      pendingByReport.set(photo.report_id, left);
      if (left <= 0) {
        await updateReportStatus(photo.report_id, "sent", new Date().toISOString());
        await supabase.from("reports").update({
          status: "sent",
          updated_at: new Date().toISOString(),
        }).eq("id", photo.report_id);
      }
      if (opts?.onProgress) opts.onProgress(done, total);
    }
  }

  for (const report of pendingReports) {
    if (!pendingByReport.has(report.id)) {
      await updateReportStatus(report.id, "sent", new Date().toISOString());
      await supabase.from("reports").update({
        status: "sent",
        updated_at: new Date().toISOString(),
      }).eq("id", report.id);
    }
  }

  return { reports: pendingReports.length, photos: done };
}

async function uploadAndInsertPhoto(supabase: ReturnType<typeof getSupabase>, photo: OfflinePhoto): Promise<boolean> {
  const cleanName = sanitizeFileName(photo.file_name || "foto.jpg");
  const path = `${photo.report_id}/${photo.id}-${cleanName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, photo.blob, {
      upsert: true,
      contentType: (photo.blob as any).type || "application/octet-stream",
    });

  if (uploadError) {
    console.error("Supabase storage upload error:", uploadError);
    return false;
  }

  const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
  const remoteUrl = publicData?.publicUrl || path;

  const { error: insertError } = await supabase.from("photos").upsert({
    id: photo.id,
    report_id: photo.report_id,
    file_name: photo.file_name,
    remote_url: remoteUrl,
    status: "uploaded",
    created_at: photo.created_at,
  });

  if (insertError) {
    console.error("Supabase photos upsert error:", insertError);
    return false;
  }

  await updatePhotoStatus(photo.id, "uploaded", remoteUrl);
  return true;
}
