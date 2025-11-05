"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Label } from "./label";
import { Input } from "./input";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import type { ReportData } from "@/types/report";
import { savePhotos, loadPhotos } from "@/lib/idb";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET;
const DISABLE_CLOUDINARY = String(process.env.NEXT_PUBLIC_DISABLE_CLOUDINARY || '').toLowerCase() === 'true';

type PhotoEntry = {
  files?: File[];
  urls?: string[];
  coordsText?: string;
  coords?: { lat: number; lng: number };
};

interface PhotoChecklistProps {
  data: ReportData;
  onChange: (field: string, value: Record<string, any>) => void;
}

const photoFields: Array<{
  id: string;
  label: string;
  requireCoords?: boolean;
  multiple?: boolean;
  minCount?: number;
}> = [
  { id: "ruaAcessoDireita", label: "RUA DE ACESSO AO IMÓVEL (direita)" },
  { id: "ruaAcessoEsquerda", label: "RUA DE ACESSO AO IMÓVEL (esquerda)" },
  { id: "calcadaDireita", label: "CALÇADA (direita)" },
  { id: "calcadaEsquerda", label: "CALÇADA (esquerda)" },
  { id: "frenteImovel1", label: "FRENTE DO IMÓVEL (1ª foto)" },
  { id: "frenteImovel2", label: "FRENTE DO IMÓVEL (2ª foto)" },
  { id: "vizinhoDireita", label: "VIZINHO DO IMÓVEL (direita)" },
  { id: "vizinhoEsquerda", label: "VIZINHO DO IMÓVEL (esquerda)" },

  { id: "posteFrente", label: "POSTE EM FRENTE AO IMÓVEL / Coordenadas GPS", requireCoords: true },
  { id: "relogioProximo", label: "RELÓGIO MAIS PRÓXIMO / Coordenadas GPS (VERIFICAR TIPO DE ENERGIA)", requireCoords: true },
  { id: "trafoProximo", label: "TRAFO MAIS PRÓXIMO / Coordenadas GPS", requireCoords: true },

  { id: "redeRua1", label: "FOTO 1 DA REDE NA RUA DO IMÓVEL" },
  { id: "redeRua2", label: "FOTO 2 DA REDE NA RUA DO IMÓVEL" },
  { id: "redePrincipal1", label: "FOTO 1 DA REDE NA RUA PRINCIPAL" },
  { id: "redePrincipal2", label: "FOTO 2 DA REDE NA RUA PRINCIPAL" },

  { id: "siteLado1", label: "FOTO DO SITE (lado 1 - Frente para trás)" },
  { id: "siteLado2", label: "FOTO DO SITE (lado 2 - Direita para esquerda)" },
  { id: "siteLado3", label: "FOTO DO SITE (lado 3 - Trás para frente)" },
  { id: "siteLado4", label: "FOTO DO SITE (lado 4 - Esquerda para direita)" },
  { id: "siteDiagonal1", label: "FOTO DO SITE (diagonal 1)" },
  { id: "siteDiagonal2", label: "FOTO DO SITE (diagonal 2)" },

  { id: "visaoGeral", label: "VISÃO GERAL DA ÁREA LOCADA" },
  { id: "cantos4", label: "FOTOS VOLTADAS PARA DENTRO DO TERRENO DOS 4 CANTOS DO IMÓVEL (quando possível)", multiple: true, minCount: 4 },
  { id: "construcoes", label: "FOTOS DE TODAS AS CONSTRUÇÕES, ÁRVORES E DETALHES NO IMÓVEL", multiple: true, minCount: 3 },
  { id: "acessoPortaria", label: "FOTOS DE TODO ACESSO DA PORTARIA OU ENTRADA ATÉ A ÁREA LOCADA (existente ou a construir e em caso de condomínio)", multiple: true, minCount: 3 },

  { id: "coordenadasGPS", label: "Coordenadas GPS do SITE", requireCoords: true },

  { id: "fotos360meio", label: "12 FOTOS 360° (do meio da área locada, iniciando no Norte)", multiple: true, minCount: 12 },
  { id: "panoramica", label: "PANORÂMICA (do mesmo local das de 360°, iniciando ao Norte)" },
  { id: "fotos360frente", label: "12 FOTOS 360° (da frente do imóvel, iniciando no Norte)", multiple: true, minCount: 12 },

  { id: "contaConcessionariaFoto", label: "CONTA DE CONCESSIONÁRIA" },
];

const ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const IS_360 = new Set(["fotos360meio", "fotos360frente"]);

function angleLabel(a: number) {
  return ${a}°;
}

function Preview({ fileOrUrl }: { fileOrUrl?: File | string }) {
  if (!fileOrUrl) return null;
  const src = typeof fileOrUrl === "string" ? fileOrUrl : URL.createObjectURL(fileOrUrl);
  return (
    <img
      src={src}
      alt="preview"
      className="mt-2 h-16 w-16 rounded border object-cover"
      onLoad={(e) => { if (typeof fileOrUrl !== 'string') URL.revokeObjectURL((e.target as HTMLImageElement).src); }}
    />
  );
}

async function compressImage(file: File, quality = 0.85): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.(png|jpg|jpeg)$/i, '.jpg'), { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error('Cloudinary não configurado. Defina NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME e NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET.');
  const url = https://api.cloudinary.com/v1_1//upload;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(url, { method: 'POST', body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Falha no upload');
  return json.secure_url as string;
}

function blobToFile(blob: Blob, name = "photo.jpg"): File {
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}

export default function PhotoChecklist({ data, onChange }: PhotoChecklistProps) {
  const photos = (data as any).photosUploads || {};
  const [isOnline, setIsOnline] = React.useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const defaultCloud = !DISABLE_CLOUDINARY && !!CLOUD_NAME && !!UPLOAD_PRESET;
  const [useCloudUpload, setUseCloudUpload] = React.useState<boolean>(defaultCloud);

  React.useEffect(() => {
    try {
      const v = localStorage.getItem("useCloudUpload");
      if (v !== null) setUseCloudUpload(v === "true");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    try { localStorage.setItem("useCloudUpload", String(useCloudUpload)); } catch {}
  }, [useCloudUpload]);

  React.useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const setEntry = (id: string, partial: Partial<PhotoEntry>) => {
    const next = { ...photos, [id]: { ...(photos[id] || {}), ...partial } };
    onChange("photosUploads", next);
  };

  const onFiles = async (id: string, fileList: FileList | null, minCount?: number) => {
    const files = fileList ? Array.from(fileList) : [];
    const MAX = 20 * 1024 * 1024; // 20MB
    const tooBig = files.find((f) => f.size > MAX);
    if (tooBig) { alert(O arquivo "" excede 20MB e não será aceito.); return; }
    const processed: File[] = [];
    for (const f of files) processed.push(await compressImage(f, 0.85));

    try {
      if (isOnline && CLOUD_NAME && UPLOAD_PRESET && !DISABLE_CLOUDINARY && useCloudUpload) {
        const urls: string[] = [];
        for (const f of processed) urls.push(await uploadToCloudinary(f));
        setEntry(id, { files: processed, urls });
        await savePhotos(id, processed);
      } else {
        const urls: string[] = [];
        for (const f of processed) urls.push(await fileToDataURL(f));
        setEntry(id, { files: processed, urls });
        await savePhotos(id, processed);
      }
    } catch (e: any) {
      alert(Falha ao processar imagens: );
      setEntry(id, { files: processed });
      await savePhotos(id, processed);
    }

    if (minCount && processed.length < minCount) {
      alert(Selecione pelo menos  foto(s) para "".);
    }
  };

  // Handler específico para 360°: um input por ângulo
  const onFileForAngle = async (id: string, angleIndex: number, fileList: FileList | null) => {
    const file = fileList && fileList[0] ? fileList[0] : undefined;
    const entry: PhotoEntry = photos[id] || {};
    const currentFiles: File[] = Array.from(entry.files || []);
    const currentUrls: string[] = Array.from(entry.urls || []);

    if (!file) {
      // limpar ângulo
      currentFiles[angleIndex] = undefined as any;
      currentUrls[angleIndex] = undefined as any;
      setEntry(id, { files: currentFiles, urls: currentUrls });
      // salva estado atual (salva apenas os existentes)
      const blobs = currentFiles.filter(Boolean) as any as File[];
      await savePhotos(${id}:, []);
      return;
    }

    const processed = await compressImage(file, 0.85);
    try {
      let url: string | undefined;
      if (isOnline && CLOUD_NAME && UPLOAD_PRESET && !DISABLE_CLOUDINARY && useCloudUpload) {
        url = await uploadToCloudinary(processed);
      } else {
        url = await fileToDataURL(processed);
      }
      currentFiles[angleIndex] = processed;
      currentUrls[angleIndex] = url;
      setEntry(id, { files: currentFiles, urls: currentUrls });
      // Persistir este ângulo individualmente no IDB
      await savePhotos(${id}:, [processed]);
    } catch (e: any) {
      alert(Falha no upload/processamento: );
      currentFiles[angleIndex] = processed;
      setEntry(id, { files: currentFiles, urls: currentUrls });
      await savePhotos(${id}:, [processed]);
    }
  };

  const handleUseGPS = (id: string) => {
    if (!('geolocation' in navigator)) {
      alert('Geolocalização não suportada neste dispositivo/navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setEntry(id, { coordsText: ${latitude.toFixed(6)}, , coords: { lat: latitude, lng: longitude } });
      },
      (err) => {
        alert(Não foi possível obter localização: );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Carregar do IndexedDB ao montar
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const item of photoFields) {
        if (IS_360.has(item.id)) {
          const entry: PhotoEntry = photos[item.id] || {};
          const newFiles: File[] = Array.from(entry.files || []);
          for (let i = 0; i < ANGLES.length; i++) {
            const blobs = await loadPhotos(${item.id}:);
            if (cancelled) return;
            if (blobs && blobs[0]) newFiles[i] = blobToFile(blobs[0], ngle-.jpg);
          }
          if (newFiles.some(Boolean)) setEntry(item.id, { files: newFiles });
        } else {
          const blobs = await loadPhotos(item.id);
          if (cancelled) return;
          if (blobs && blobs.length > 0) {
            const files = blobs.map((b, i) => blobToFile(b, photo-.jpg));
            setEntry(item.id, { files });
          }
        }
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklist de Fotos</CardTitle>
        <p className="text-sm text-gray-600">
          <strong>OBS.:</strong> Sempre demarcar a área locada com <em>tira zebrada</em>.
        </p>
        {!isOnline && (
          <p className="text-xs text-amber-700 mt-1">
            Modo offline: fotos serão salvas localmente e não serão enviadas agora.
          {(CLOUD_NAME && UPLOAD_PRESET) ? (
            <div className="mt-1 flex items-center gap-2">
              <Checkbox id="use-cloud-upload" checked={useCloudUpload} onCheckedChange={(v) => setUseCloudUpload(!!v)} disabled={DISABLE_CLOUDINARY} />
              <Label htmlFor="use-cloud-upload" className={`text-sm ${DISABLE_CLOUDINARY ? "opacity-60" : ""}`}>Enviar fotos para a nuvem (Cloudinary)</Label>
              {DISABLE_CLOUDINARY && <span className="text-xs text-amber-700">(desativado por configuração)</span>}
            </div>
          ) : (
            <p className="mt-1 text-xs text-gray-500">Cloudinary não configurado; fotos serão salvas localmente.</p>
          )}
          </p>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {photoFields.map((item) => {
            const entry: PhotoEntry = photos[item.id] || {};

            // Render especial para 12 FOTOS 360°
            if (IS_360.has(item.id)) {
              return (
                <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
                  <Label className="block font-medium text-gray-800">{item.label}</Label>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {ANGLES.map((a, idx) => {
                      const file = entry.files && entry.files[idx];
                      const url = entry.urls && entry.urls[idx];
                      const value = url || file;
                      return (
                        <div key={idx} className="border rounded p-2">
                          <div className="text-xs text-gray-700 mb-1">Ângulo: {angleLabel(a)}</div>
                          <input
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={(e) => onFileForAngle(item.id, idx, e.target.files)}
                            className="block w-full cursor-pointer rounded-md border border-gray-300 bg-white p-1 text-xs file:mr-2 file:rounded file:border-0 file:bg-[#77807a] file:hover:bg-[#5f6762] file:px-2 file:py-1 file:text-white"
                          />
                          <Preview fileOrUrl={value} />
                        </div>
                      );
                    })}
                  </div>

                  {item.requireCoords && (
                    <div className="mt-3 space-y-1">
                      <Label className="text-xs text-gray-600">Capturar Coordenadas</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex.: -23.55052, -46.63331"
                          value={entry.coordsText || ''}
                          onChange={(e) => setEntry(item.id, { coordsText: e.target.value })}
                        />
                        <Button type="button" className="bg-[#77807a] hover:bg-[#5f6762] text-white" onClick={() => handleUseGPS(item.id)}>
                          Usar GPS
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // Demais itens (comportamento original)
            const labels = item.multiple
              ? Array.from({ length: entry.files?.length || entry.urls?.length || 0 }, (_, i) => ${i + 1})
              : undefined;

            return (
              <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <Label htmlFor={ile-} className="block font-medium text-gray-800">
                  {item.label}
                </Label>

                <input
                  id={ile-]
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple={!!item.multiple}
                  className="mt-2 block w-full cursor-pointer rounded-md border border-gray-300 bg-white p-2 text-sm file:mr-4 file:rounded file:border-0 file:bg-[#77807a] file:hover:bg-[#5f6762] file:px-4 file:py-2 file:text-white"
                  onChange={(e) => onFiles(item.id, e.target.files, item.minCount)}
                />

                {/* Pré-visualização simples para demais itens */}
                {(entry.files && entry.files.length > 0) || (entry.urls && entry.urls.length > 0) ? (
                  <div className="mt-2 grid grid-cols-3 md:grid-cols-4 gap-2">
                    {(entry.urls && entry.urls.length > 0 ? entry.urls : entry.files || []).map((it: any, idx: number) => (
                      <div key={idx} className="relative w-24 h-24 overflow-hidden rounded-md border bg-gray-50">
                        <img
                          src={typeof it === 'string' ? it : URL.createObjectURL(it)}
                          alt={typeof it === 'string' ? oto- : it.name}
                          className="w-full h-full object-cover"
                          onLoad={(e) => { if (typeof it !== 'string') URL.revokeObjectURL((e.target as HTMLImageElement).src); }}
                        />
                        {labels && labels[idx] && (
                          <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded">{labels[idx]}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}

                {item.requireCoords && (
                  <div className="mt-3 space-y-1">
                    <Label className="text-xs text-gray-600">Capturar Coordenadas</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex.: -23.55052, -46.63331"
                        value={entry.coordsText || ''}
                        onChange={(e) => setEntry(item.id, { coordsText: e.target.value })}
                      />
                      <Button type="button" className="bg-[#77807a] hover:bg-[#5f6762] text-white" onClick={() => handleUseGPS(item.id)}>
                        Usar GPS
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}




