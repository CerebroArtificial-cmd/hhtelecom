"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Label } from "./label";
import { Input } from "./input";
import { Button } from "./button";
import type { ReportData } from "@/types/report";

type PhotoEntry = {
  files?: File[];
  urls?: string[];
  names?: string[];
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
  fixedSlots?: number;
}> = [
  { id: "ruaAcessoDireita", label: "RUA DE ACESSO AO IMÃ“VEL (direita)" },
  { id: "ruaAcessoEsquerda", label: "RUA DE ACESSO AO IMÃ“VEL (esquerda)" },
  { id: "calcadaDireita", label: "CALÃ‡ADA (direita)" },
  { id: "calcadaEsquerda", label: "CALÃ‡ADA (esquerda)" },
  { id: "frenteImovel1", label: "FRENTE DO IMÃ“VEL (1Âª foto)" },
  { id: "frenteImovel2", label: "FRENTE DO IMÃ“VEL (2Âª foto)" },
  { id: "vizinhoDireita", label: "VIZINHO DO IMÃ“VEL (direita)" },
  { id: "vizinhoEsquerda", label: "VIZINHO DO IMÃ“VEL (esquerda)" },

  { id: "posteFrente", label: "POSTE EM FRENTE AO IMÃ“VEL / Coordenadas GPS", requireCoords: true },
  { id: "relogioProximo", label: "RELÃ“GIO MAIS PRÃ“XIMO / Coordenadas GPS (VERIFICAR TIPO DE ENERGIA)", requireCoords: true },
  { id: "trafoProximo", label: "TRAFO MAIS PRÃ“XIMO / Coordenadas GPS", requireCoords: true },

  { id: "redeRua1", label: "FOTO 1 DA REDE NA RUA DO IMÃ“VEL" },
  { id: "redeRua2", label: "FOTO 2 DA REDE NA RUA DO IMÃ“VEL" },
  { id: "redePrincipal1", label: "FOTO 1 DA REDE NA RUA PRINCIPAL" },
  { id: "redePrincipal2", label: "FOTO 2 DA REDE NA RUA PRINCIPAL" },

  { id: "siteLado1", label: "FOTO DO SITE (lado 1 - Frente para trÃ¡s)" },
  { id: "siteLado2", label: "FOTO DO SITE (lado 2 - Direita para esquerda)" },
  { id: "siteLado3", label: "FOTO DO SITE (lado 3 - TrÃ¡s para frente)" },
  { id: "siteLado4", label: "FOTO DO SITE (lado 4 - Esquerda para direita)" },
  { id: "siteDiagonal1", label: "FOTO DO SITE (diagonal 1)" },
  { id: "siteDiagonal2", label: "FOTO DO SITE (diagonal 2)" },

  { id: "visaoGeral", label: "VISÃƒO GERAL DA ÃREA LOCADA" },
  { id: "cantos4", label: "FOTOS VOLTADAS PARA DENTRO DO TERRENO DOS 4 CANTOS DO IMÃ“VEL (quando possÃ­vel)", fixedSlots: 4 },
  { id: "construcoes", label: "FOTOS DE TODAS AS CONSTRUÃ‡Ã•ES, ÃRVORES E DETALHES NO IMÃ“VEL", fixedSlots: 4 },
  { id: "acessoPortaria", label: "FOTOS DE TODO ACESSO DA PORTARIA OU ENTRADA ATÃ‰ A ÃREA LOCADA (existente ou a construir e em caso de condomÃ­nio)", fixedSlots: 4 },

  { id: "coordenadasGPS", label: "Coordenadas GPS do SITE", requireCoords: true },

  { id: "fotos360meio", label: "12 FOTOS 360Â° (do meio da Ã¡rea locada, iniciando no Norte)", multiple: true, minCount: 12 },
  { id: "panoramica", label: "PANORÃ‚MICA (do mesmo local das de 360Â°, iniciando ao Norte)" },
  { id: "fotos360frente", label: "12 FOTOS 360Â° (da frente do imÃ³vel, iniciando no Norte)", multiple: true, minCount: 12 },

  { id: "contaConcessionariaFoto", label: "CONTA DE CONCESSIONÃRIA" },
];

const ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
const IS_360 = new Set(["fotos360meio", "fotos360frente"]);

const RT_FIELDS: Array<{ id: string; label: string; requireCoords?: boolean; multiple?: boolean; minCount?: number; fixedSlots?: number; }> = [
  { id: "rt_fachada_1", label: "FOTO DA FACHADA 1" },
  { id: "rt_fachada_2", label: "FOTO DA FACHADA 2" },
  { id: "rt_trafo_interno_1", label: "TRAFO INTERNO 1" },
  { id: "rt_trafo_interno_2", label: "TRAFO INTERNO 2" },
  { id: "rt_espaco_medidor_1", label: "ESPACO PARA O MEDIDOR 1" },
  { id: "rt_espaco_medidor_2", label: "ESPACO MEDIDOR 2" },
  { id: "rt_passagem_cabos_1", label: "PASSAGEM DE CABOS 1" },
  { id: "rt_passagem_cabos_2", label: "PASSAGEM DE CABOS 2" },
  { id: "rt_elevador_1", label: "ELEVADOR 1" },
  { id: "rt_elevador_2", label: "ELEVADOR 2" },
  { id: "rt_placa_elevador", label: "PLACA DO ELEVADOR" },
  { id: "rt_quadro_dg", label: "QUADRO DG" },
  { id: "rt_escada_1", label: "ESCADA 1" },
  { id: "rt_escada_2", label: "ESCADA 2" },
  { id: "rt_acesso_topo_1", label: "ACESSO AO TOPO 1" },
  { id: "rt_acesso_topo_2", label: "ACESSO AO TOPO 2" },
  { id: "rt_acesso_topo_3", label: "ACESSO AO TOPO 3" },
  { id: "rt_area_equip_1", label: "AREA DOS EQUIPAMENTOS 1" },
  { id: "rt_area_equip_2", label: "AREA DOS EQUIPAMENTOS 2" },
  { id: "rt_area_equip_3", label: "AREA DOS EQUIPAMENTOS 3" },
  { id: "rt_energia_topo_1", label: "ENERGIA NO TOPO 1" },
  { id: "rt_energia_topo_2", label: "ENERGIA NO TOPO 2" },
  { id: "rt_caixa_dagua_1", label: "CAIXA DAGUA 1" },
  { id: "rt_caixa_dagua_2", label: "CAIXA DAGUA 2" },
  { id: "rt_interna_caixa_dagua_1", label: "INTERNA CAIXA DAGUA 1" },
  { id: "rt_interna_caixa_dagua_2", label: "INTERNA CAIXA DAGUA 2" },
  { id: "rt_para_raios_1", label: "PARA-RAIOS 1" },
  { id: "rt_para_raios_2", label: "PARA-RAIOS 2" }
];

const RT_IDS = new Set(RT_FIELDS.map((f) => f.id));
const GROUP_360 = new Set(["panoramica", ...IS_360]);

function angleLabel(a: number) {
  return `${a}\u00B0`;
}

function fileLabel(fileOrUrl?: File | string) {
  if (!fileOrUrl) return "";
  if (typeof fileOrUrl === "string") {
    const parts = fileOrUrl.split("/");
    return parts[parts.length - 1] || "arquivo";
  }
  return fileOrUrl.name || "arquivo";
}
function nameLabel(names?: string[], idx?: number) {
  if (!names || names.length === 0) return "";
  if (idx === undefined) return names[0] || "";
  return names[idx] || "";
}
function countSelected(entry: PhotoEntry | undefined) {
  if (!entry) return 0;
  const files = entry.files?.filter(Boolean) || [];
  const urls = entry.urls?.filter(Boolean) || [];
  const names = entry.names?.filter(Boolean) || [];
  return Math.max(files.length, urls.length, names.length);
}

function totalSelected(photos: Record<string, PhotoEntry>) {
  let total = 0;
  for (const key of Object.keys(photos || {})) {
    total += countSelected(photos[key]);
  }
  return total;
}

function pad3(n: number) {
  return String(n).padStart(3, "0");
}

function buildPhotoId(siteId: string | undefined, seq: number) {
  const base = (siteId && String(siteId).trim()) ? String(siteId).trim() : "SITE";
  return `${base}_foto_${pad3(seq)}`;
}

function renameWithId(file: File, photoId: string) {
  const name = file.name || "foto.jpg";
  const ext = name.includes(".") ? name.split(".").pop() : "jpg";
  const newName = `${photoId}.${ext}`.replace(/\.+/g, ".");
  return new File([file], newName, { type: file.type || "image/jpeg" });
}

function Preview({ fileOrUrl }: { fileOrUrl?: File | string }) {
  if (!fileOrUrl) return null;
  const src = typeof fileOrUrl === "string" ? fileOrUrl : URL.createObjectURL(fileOrUrl);
  return (
    <img
      src={src}
      alt="preview"
      className="mt-2 h-16 w-16 rounded border object-cover"
      onLoad={(e) => { if (typeof fileOrUrl !== "string") URL.revokeObjectURL((e.target as HTMLImageElement).src); }}
    />
  );
}

async function compressImage(file: File, quality = 0.85): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.(png|jpg|jpeg)$/i, ".jpg"), { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export default function PhotoChecklist({ data, onChange }: PhotoChecklistProps) {
  const photos = (data as any).photosUploads || {};
  const [photoView, setPhotoView] = React.useState<"gf" | "rt" | "360">("gf");
  const [isOffline, setIsOffline] = React.useState<boolean>(() => {
    if (typeof navigator === "undefined") return false;
    return !navigator.onLine;
  });
  const siteId = (data as any)?.siteId;

  React.useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
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
    if (tooBig) { alert(`O arquivo "${tooBig.name}" excede 20MB e nÃ£o serÃ¡ aceito.`); return; }
    const processed: File[] = [];
    const names: string[] = [];
    let seq = totalSelected(photos) + 1;
    for (const f of files) {
      const compressed = await compressImage(f, 0.85);
      const photoId = buildPhotoId(siteId, seq++);
      const renamed = renameWithId(compressed, photoId);
      processed.push(renamed);
      names.push(renamed.name);
    }

    setEntry(id, { files: processed, urls: [], names });

    if (minCount && processed.length < minCount) {
      alert(`Selecione pelo menos ${minCount} foto(s) para "${id}".`);
    }
  };

  // Handler especÃ­fico para 360Â°: um input por Ã¢ngulo
  const onFileForAngle = async (id: string, angleIndex: number, fileList: FileList | null) => {
    const file = fileList && fileList[0] ? fileList[0] : undefined;
    const entry: PhotoEntry = photos[id] || {};
    const currentFiles: File[] = Array.from(entry.files || []);
    const currentUrls: string[] = Array.from(entry.urls || []);
    const currentNames: string[] = Array.from(entry.names || []);

    if (!file) {
      // limpar Ã¢ngulo
      currentFiles[angleIndex] = undefined as any;
      currentUrls[angleIndex] = undefined as any;
      currentNames[angleIndex] = undefined as any;
      setEntry(id, { files: currentFiles, urls: currentUrls, names: currentNames });
      return;
    }

    const processed = await compressImage(file, 0.85);
    const photoId = buildPhotoId(siteId, totalSelected(photos) + 1);
    const renamed = renameWithId(processed, photoId);
    currentFiles[angleIndex] = renamed;
    currentUrls[angleIndex] = undefined as any;
    currentNames[angleIndex] = renamed.name;
    setEntry(id, { files: currentFiles, urls: currentUrls, names: currentNames });
  };

  const onFileForSlot = async (id: string, slotIndex: number, fileList: FileList | null) => {
    const file = fileList && fileList[0] ? fileList[0] : undefined;
    const entry: PhotoEntry = photos[id] || {};
    const currentFiles: File[] = Array.from(entry.files || []);
    const currentUrls: string[] = Array.from(entry.urls || []);
    const currentNames: string[] = Array.from(entry.names || []);

    if (!file) {
      currentFiles[slotIndex] = undefined as any;
      currentUrls[slotIndex] = undefined as any;
      currentNames[slotIndex] = undefined as any;
      setEntry(id, { files: currentFiles, urls: currentUrls, names: currentNames });
      return;
    }

    const processed = await compressImage(file, 0.85);
    const photoId = buildPhotoId(siteId, totalSelected(photos) + 1);
    const renamed = renameWithId(processed, photoId);
    currentFiles[slotIndex] = renamed;
    currentUrls[slotIndex] = undefined as any;
    currentNames[slotIndex] = renamed.name;
    setEntry(id, { files: currentFiles, urls: currentUrls, names: currentNames });
  };

  const handleUseGPS = (id: string) => {
    if (!("geolocation" in navigator)) {
      alert("GeolocalizaÃ§Ã£o nÃ£o suportada neste dispositivo/navegador.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setEntry(id, { coordsText: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, coords: { lat: latitude, lng: longitude } });
      },
      (err) => {
        alert(`NÃ£o foi possÃ­vel obter localizaÃ§Ã£o: ${err?.message || err}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const visibleFields = photoView === "360"
    ? photoFields.filter((item) => GROUP_360.has(item.id))
    : photoView === "rt"
    ? RT_FIELDS
    : photoFields.filter((item) => !GROUP_360.has(item.id) && !RT_IDS.has(item.id));

  return (
    <Card>
      <CardHeader>
          <div className="flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            className="bg-[#760406] text-[#f8f8f8] hover:bg-[#5f0304] text-lg sm:text-xl font-semibold"
            onClick={() => setPhotoView("gf")}
          >
            Fotos GF
          </Button>
          <Button
            type="button"
            className="bg-[#760406] text-[#f8f8f8] hover:bg-[#5f0304] text-lg sm:text-xl font-semibold"
            onClick={() => setPhotoView("rt")}
          >
            Fotos RT
          </Button>
          <Button
            type="button"
            className="bg-[#760406] text-[#f8f8f8] hover:bg-[#5f0304] text-lg sm:text-xl font-semibold"
            onClick={() => setPhotoView("360")}
          >
            Fotos 360
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          <strong>OBS.:</strong> Sempre demarcar a Ã¡rea locada com <em>tira zebrada</em>.
        </p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleFields.map((item) => {
            const entry: PhotoEntry = photos[item.id] || {};
            const selectedCount = countSelected(entry);
            const totalTarget = item.fixedSlots ? item.fixedSlots : item.minCount ? item.minCount : 1;

            if (IS_360.has(item.id)) {
              return (
                <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
                  <Label className="block font-medium text-gray-800">{item.label}</Label>\n                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {ANGLES.map((a, idx) => {
                      const file = entry.files && entry.files[idx];
                      const url = entry.urls && entry.urls[idx];
                      const name = nameLabel(entry.names, idx);
                      const value = url || file;
                      return (
                        <div key={idx} className="border rounded p-2">
                          <div className="text-xs text-gray-700 mb-1">Ã‚ngulo: {angleLabel(a)}</div>
                          <input
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={(e) => onFileForAngle(item.id, idx, e.target.files)}
                            className="block w-full cursor-pointer rounded-md border border-gray-300 bg-white p-1 text-xs file:mr-2 file:rounded file:border-0 file:bg-[#77807a] file:hover:bg-[#5f6762] file:px-2 file:py-1 file:text-white"
                          />
                          {(name || value) ? (
                            <div className="mt-2 text-xs text-gray-700 break-all">
                              {name || fileLabel(value)}
                            </div>
                          ) : null}
                          {!isOffline && <Preview fileOrUrl={value} />}
                        </div>
                      );
                    })}
                  </div>

                  {item.requireCoords && (
                    <div className="mt-3 space-y-1">
                      <Label className="text-xs text-gray-600">Capturar coordenadas</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Informe as coordenadas (ex.: -23.55052, -46.63331)"
                          value={entry.coordsText || ""}
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

            if (item.fixedSlots) {
              return (
                <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
                  <Label className="block font-medium text-gray-800">{item.label}</Label>\n                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({ length: item.fixedSlots }).map((_, idx) => {
                      const file = entry.files && entry.files[idx];
                      const url = entry.urls && entry.urls[idx];
                      const name = nameLabel(entry.names, idx);
                      const value = url || file;
                      return (
                        <div key={idx} className="border rounded p-2">
                          <div className="text-xs text-gray-700 mb-1">Foto {idx + 1}</div>
                          <input
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={(e) => onFileForSlot(item.id, idx, e.target.files)}
                            className="block w-full cursor-pointer rounded-md border border-gray-300 bg-white p-1 text-xs file:mr-2 file:rounded file:border-0 file:bg-[#77807a] file:hover:bg-[#5f6762] file:px-2 file:py-1 file:text-white"
                          />
                          {(name || value) ? (
                            <div className="mt-2 text-xs text-gray-700 break-all">
                              {name || fileLabel(value)}
                            </div>
                          ) : null}
                          {!isOffline && <Preview fileOrUrl={value} />}
                        </div>
                      );
                    })}
                  </div>

                  {item.requireCoords && (
                    <div className="mt-3 space-y-1">
                      <Label className="text-xs text-gray-600">Capturar coordenadas</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Informe as coordenadas (ex.: -23.55052, -46.63331)"
                          value={entry.coordsText || ""}
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

            const labels = item.multiple
              ? Array.from({ length: entry.files?.length || entry.urls?.length || 0 }, (_, i) => i + 1)
              : undefined;

            return (
              <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <Label className="block font-medium text-gray-800">
                  {item.label}
                </Label>

                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple={!!item.multiple}
                  className="mt-2 block w-full cursor-pointer rounded-md border border-gray-300 bg-white p-2 text-sm file:mr-4 file:rounded file:border-0 file:bg-[#77807a] file:hover:bg-[#5f6762] file:px-4 file:py-2 file:text-white"
                  onChange={(e) => onFiles(item.id, e.target.files, item.minCount)}
                />\n
                {(entry.files && entry.files.length > 0) || (entry.urls && entry.urls.length > 0) ? (
                  <>
                    <div className="mt-2 space-y-1">
                      {(entry.names && entry.names.length > 0 ? entry.names : (entry.urls && entry.urls.length > 0 ? entry.urls : entry.files || [])).map((it: any, idx: number) => (
                        <div key={idx} className="text-xs text-gray-700 break-all">
                          {labels && labels[idx] ? `${labels[idx]} - ` : ""}{typeof it === "string" ? it : fileLabel(it)}
                        </div>
                      ))}
                    </div>
                    {!isOffline && (
                      <div className="mt-2 grid grid-cols-3 md:grid-cols-4 gap-2">
                        {(entry.urls && entry.urls.length > 0 ? entry.urls : entry.files || []).map((it: any, idx: number) => (
                          <div key={idx} className="relative w-24 h-24 overflow-hidden rounded-md border bg-gray-50">
                            <img
                              src={typeof it === "string" ? it : URL.createObjectURL(it)}
                              alt={typeof it === "string" ? "foto" : it.name}
                              className="w-full h-full object-cover"
                              onLoad={(e) => { if (typeof it !== "string") URL.revokeObjectURL((e.target as HTMLImageElement).src); }}
                            />
                            {labels && labels[idx] && (
                              <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1 rounded">{labels[idx]}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : null}

                {item.requireCoords && (
                  <div className="mt-3 space-y-1">
                    <Label className="text-xs text-gray-600">Capturar coordenadas</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Informe as coordenadas (ex.: -23.55052, -46.63331)"
                        value={entry.coordsText || ""}
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


