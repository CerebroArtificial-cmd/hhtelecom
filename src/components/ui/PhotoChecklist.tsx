"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Label } from "./label";
import { Input } from "./input";
import type { ReportData } from "@/types/report";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET;

type PhotoEntry = { files?: File[]; urls?: string[]; coordsText?: string };

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

  { id: "fotos360meio", label: "12 FOTOS 360 (do meio da área locada, iniciando no Norte)", multiple: true, minCount: 12 },
  { id: "panoramica", label: "PANORÂMICA (do mesmo local das de 360, iniciando ao Norte)" },
  { id: "fotos360frente", label: "12 FOTOS 360 (da frente do imóvel, iniciando no Norte)", multiple: true, minCount: 12 },

  { id: "contaConcessionariaFoto", label: "CONTA DE CONCESSIONÁRIA" },
];

const ANGLES = [0,30,60,90,120,150,180,210,240,270,300,330];

function Thumbs({ files, urls, labels }: { files?: File[]; urls?: string[]; labels?: string[] }) {
  const items = (urls && urls.length > 0) ? urls : files;
  if (!items || (Array.isArray(items) && (items as any).length === 0)) return null;
  return (
    <div className="mt-2 grid grid-cols-3 md:grid-cols-4 gap-2">
      {Array.from(items as any).map((it: any, idx: number) => (
        <div key={idx} className="relative w-24 h-24 overflow-hidden rounded-md border bg-gray-50">
          <img
            src={typeof it === 'string' ? it : URL.createObjectURL(it)}
            alt={typeof it === 'string' ? `foto-${idx+1}` : it.name}
            className="w-full h-full object-cover"
            onLoad={(e) => { if (typeof it !== 'string') URL.revokeObjectURL((e.target as HTMLImageElement).src); }}
          />
          <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded">
            {labels && labels[idx] ? labels[idx] : `#${idx + 1}`}
          </span>
        </div>)
      )}
    </div>
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

async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) throw new Error('Cloudinary não configurado. Defina NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME e NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET.');
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(url, { method: 'POST', body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || 'Falha no upload');
  return json.secure_url as string;
}

export default function PhotoChecklist({ data, onChange }: PhotoChecklistProps) {
  const photos = (data as any).photosUploads || {};

  const setEntry = (id: string, partial: Partial<PhotoEntry>) => {
    const next = { ...photos, [id]: { ...(photos[id] || {}), ...partial } };
    onChange("photosUploads", next);
  };

  const onFiles = async (id: string, fileList: FileList | null, minCount?: number) => {
    const files = fileList ? Array.from(fileList) : [];
    const MAX = 20 * 1024 * 1024; // 20MB
    const tooBig = files.find((f) => f.size > MAX);
    if (tooBig) { alert(`O arquivo "${tooBig.name}" excede 20MB e não será aceito.`); return; }
    const processed: File[] = [];
    for (const f of files) processed.push(await compressImage(f, 0.85));

    try {
      const urls: string[] = [];
      for (const f of processed) urls.push(await uploadToCloudinary(f));
      setEntry(id, { files: processed, urls });
    } catch (e: any) {
      alert(`Falha ao enviar imagens: ${e?.message || e}`);
      setEntry(id, { files: processed });
    }

    if (minCount && processed.length < minCount) {
      alert(`Selecione pelo menos ${minCount} foto(s) para "${id}".`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklist de Fotos</CardTitle>
        <p className="text-sm text-gray-600">
          <strong>OBS.:</strong> Sempre demarcar a área locada com <em>tira zebrada</em>.
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {photoFields.map((item) => {
            const entry: PhotoEntry = photos[item.id] || {};
            const labels = (item.id === 'fotos360meio' || item.id === 'fotos360frente')
              ? ANGLES.map((a) => `${a}°`)
              : item.id === 'cantos4'
                ? ['1/4','2/4','3/4','4/4']
                : item.multiple
                  ? Array.from({ length: entry.files?.length || entry.urls?.length || 0 }, (_, i) => `${i + 1}`)
                  : undefined;

            return (
              <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <Label htmlFor={`file-${item.id}`} className="block font-medium text-gray-800">
                  {item.label}
                </Label>

                <input
                  id={`file-${item.id}`}
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple={!!item.multiple}
                  className="mt-2 block w-full cursor-pointer rounded-md border border-gray-300 bg-white p-2 text-sm file:mr-4 file:rounded file:border-0 file:bg-[#77807a] file:hover:bg-[#5f6762] file:px-4 file:py-2 file:text-white"
                  onChange={(e) => onFiles(item.id, e.target.files, item.minCount)}
                />

                <Thumbs files={entry.files} urls={entry.urls} labels={labels} />

                {item.requireCoords && (
                  <div className="mt-3 space-y-1">
                    <Label className="text-xs text-gray-600">Capturar Coordenadas</Label>
                    <Input
                      placeholder="Ex.: -23.55052, -46.63331"
                      value={entry.coordsText || ''}
                      onChange={(e) => setEntry(item.id, { coordsText: e.target.value })}
                    />
                  </div>
                )}

                {(item.id === 'fotos360meio' || item.id === 'fotos360frente') && (
                  <p className="mt-2 text-xs text-gray-500">Ângulos sugeridos: 0°, 30°, 60°, 90°, 120°, 150°, 180°, 210°, 240°, 270°, 300°, 330°</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}