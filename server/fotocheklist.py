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
const DISABLE_CLOUDINARY = String(process.env.NEXT_PUBLIC_DISABLE_CLOUDINARY || "").toLowerCase() === "true";

```tsx
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Label } from "./label";
import { Input } from "./input";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import type { ReportData } from "@/types/report";
import { savePhotos, loadPhotos } from "@/lib/idb";

"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Label } from "./label";
import { Input } from "./input";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import type { ReportData } from "@/types/report";
import { savePhotos, loadPhotos } from "@/lib/idb";

/**
 * Arquivo: PhotoCheklist.py (conteúdo TSX)
 * Obs.: apesar do nome .py, isso é um componente React/Next (TSX).
 */

type Props = {
  report: ReportData;
  onChange: (next: ReportData) => void;
};

type PhotoStore = Record<string, File | null>;

function getFileFromInput(e: React.ChangeEvent<HTMLInputElement>): File | null {
  const f = e.target.files?.[0];
  return f ?? null;
}

function PhotoInput({
  title,
  photoKey,
  photos,
  setPhotos,
}: {
  title: string;
  photoKey: string;
  photos: PhotoStore;
  setPhotos: React.Dispatch<React.SetStateAction<PhotoStore>>;
}) {
  const file = photos[photoKey] ?? null;

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Label className="block text-sm font-semibold">{title}</Label>
          <div className="mt-1 text-xs text-muted-foreground break-words">
            {file ? `Selecionado: ${file.name}` : "Nenhum arquivo escolhido"}
          </div>
        </div>

        {file ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setPhotos((prev) => {
                const next = { ...prev, [photoKey]: null };
                void savePhotos(next);
                return next;
              })
            }
          >
            Remover
          </Button>
        ) : null}
      </div>

      <div className="mt-2">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = getFileFromInput(e);
            setPhotos((prev) => {
              const next = { ...prev, [photoKey]: f };
              void savePhotos(next);
              return next;
            });
          }}
        />
      </div>
    </div>
  );
}

function GridSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>
      </CardContent>
    </Card>
  );
}

const ANGLES_360 = [
  "0°",
  "30°",
  "60°",
  "90°",
  "120°",
  "150°",
  "180°",
  "210°",
  "240°",
  "270°",
  "300°",
  "330°",
];

const FOUR_SLOTS = ["1", "2", "3", "4"];

function angleKey(angle: string) {
  return angle.replace("°", ""); // "30°" -> "30"
}

export default function PhotoChecklist({ report, onChange }: Props) {
  // ====== Fotos (salvas no IndexedDB via savePhotos/loadPhotos) ======
  const [photos, setPhotos] = React.useState<PhotoStore>({});

  // ====== Coordenadas (mantém onde existe) ======
  const coords = (report as any)?.photos_coords ?? {};
  const [coordPoste, setCoordPoste] = React.useState<string>(coords.poste ?? "");
  const [coordRelogio, setCoordRelogio] = React.useState<string>(
    coords.relogio ?? ""
  );
  const [coordTrafo, setCoordTrafo] = React.useState<string>(coords.trafo ?? "");
  const [coordSite, setCoordSite] = React.useState<string>(coords.site ?? "");

  // Carrega fotos do IDB ao abrir
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const loaded = (await loadPhotos()) as PhotoStore | null;
        if (alive && loaded) setPhotos(loaded);
      } catch {
        // silencioso
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Empurra coordenadas para o report
  React.useEffect(() => {
    const next = {
      ...report,
      photos_coords: {
        ...(coords || {}),
        poste: coordPoste,
        relogio: coordRelogio,
        trafo: coordTrafo,
        site: coordSite,
      },
    } as any;

    onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordPoste, coordRelogio, coordTrafo, coordSite]);

  const clearAll = async () => {
    setPhotos({});
    await savePhotos({});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Checklist de Fotos</h2>
          <p className="text-sm text-muted-foreground">
            OBS.: Sempre demarcar a área locada com tira zebrada.
          </p>
        </div>

        <Button type="button" variant="secondary" onClick={clearAll}>
          Limpar fotos
        </Button>
      </div>

      <GridSection title="Acesso e fachada">
        <PhotoInput
          title="RUA DE ACESSO AO IMÓVEL (direita)"
          photoKey="acesso_rua_direita"
          photos={photos}
          setPhotos={setPhotos}
        />
        <PhotoInput
          title="RUA DE ACESSO AO IMÓVEL (esquerda)"
          photoKey="acesso_rua_esquerda"
          photos={photos}
          setPhotos={setPhotos}
        />
        <PhotoInput
          title="CALÇADA (direita)"
          photoKey="calcada_direita"
          photos={photos}
          setPhotos={setPhotos}
        />
        <PhotoInput
          title="CALÇADA (esquerda)"
          photoKey="calcada_esquerda"
          photos={photos}
          setPhotos={setPhotos}
        />
        <PhotoInput
          title="FRENTE DO IMÓVEL (1ª foto)"
          photoKey="frente_01"
          photos={photos}
          setPhotos={setPhotos}
        />
        <PhotoInput
          title="FRENTE DO IMÓVEL (2ª foto)"
          photoKey="frente_02"
          photos={photos}
          setPhotos={setPhotos}
        />
        <PhotoInput
          title="VIZINHO DO IMÓVEL (direita)"
          photoKey="vizinho_direita"
          photos={photos}
          setPhotos={setPhotos}
        />
        <PhotoInput
          title="VIZINHO DO IMÓVEL (esquerda)"
          photoKey="vizinho_esquerda"
          photos={photos}
          setPhotos={setPhotos}
        />
      </GridSection>

      {/* Poste + coords */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            POSTE EM FRENTE AO IMÓVEL / Coordenadas GPS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PhotoInput
            title="Foto do poste"
            photoKey="poste_foto"
            photos={photos}
            setPhotos={setPhotos}
          />
          <div>
            <Label>Capturar Coordenadas</Label>
            <Input
              placeholder="Ex.: -23.55052, -46.63331"
              value={coordPoste}
              onChange={(e) => setCoordPoste(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Relógio + coords */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            RELÓGIO MAIS PRÓXIMO / Coordenadas GPS (VERIFICAR TIPO DE ENERGIA)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PhotoInput
            title="Foto do relógio"
            photoKey="relogio_foto"
            photos={photos}
            setPhotos={setPhotos}
          />
          <div>
            <Label>Capturar Coordenadas</Label>
            <Input
              placeholder="Ex.: -23.55052, -46.63331"
              value={coordRelogio}
              onChange={(e) => setCoordRelogio(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trafo + coords */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            TRAFO MAIS PRÓXIMO / Coordenadas GPS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PhotoInput
            title="Foto do trafo"
            photoKey="trafo_foto"
            photos={photos}
            setPhotos={setPhotos}
          />
          <div>
            <Label>Capturar Coordenadas</Label>
            <Input
              placeholder="Ex.: -23.55052, -46.63331"
              value={coordTrafo}
              onChange={(e) => setCoordTrafo(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <GridSection title="Rede / rua / site (básico)">
        <PhotoInput
          title="FOTO 1 DA REDE NA RUA DO IMÓVEL"
          photoKey="rede_rua_imovel_01"
          photos={photos}
          setPhotos={setPhotos}
        />
        <PhotoInput
          title="FOTO 2 DA REDE NA RUA DO IMÓVEL"
          photoKey="rede_rua_imovel_02"
          photos={photos}
          setPhotos={setPhotos}
        />
        <PhotoInput
          title="FOTO 1 DA REDE NA RUA PRINCIPAL"
          photoKey="rede_rua_principal_01"
          photos={photos}
          setPhotos={setPhotos}
        />
        <PhotoInput
          title="FOTO 2 DA REDE NA RUA PRINCIPAL"
          photoKey="rede_rua_principal_02"
          photos={photos}
          setPhotos={setPhotos}
        />
      </GridSection>

      {/* 4 entradas — mesmo padrão (map) */}
      <GridSection title="FOTOS VOLTADAS PARA DENTRO DO TERRENO DOS 4 CANTOS (quando possível)">
        {FOUR_SLOTS.map((n) => (
          <PhotoInput
            key={n}
            title={`Canto ${n}`}
            photoKey={`terreno_4_cantos_${n}`}
            photos={photos}
            setPhotos={setPhotos}
          />
        ))}
      </GridSection>

      {/* 4 entradas — mesmo padrão (map) */}
      <GridSection title="FOTOS DE TODO ACESSO DA PORTARIA OU ENTRADA ATÉ A ÁREA LOCADA (existente ou a construir, em caso de condomínio)">
        {FOUR_SLOTS.map((n) => (
          <PhotoInput
            key={n}
            title={`Acesso ${n}`}
            photoKey={`acesso_portaria_entrada_${n}`}
            photos={photos}
            setPhotos={setPhotos}
          />
        ))}
      </GridSection>

      {/* Coordenadas GPS do site (mantém input) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coordenadas GPS do SITE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PhotoInput
            title="Foto / comprovante das coordenadas (se aplicável)"
            photoKey="coords_site_foto"
            photos={photos}
            setPhotos={setPhotos}
          />
          <div>
            <Label>Capturar Coordenadas</Label>
            <Input
              placeholder="Ex.: -23.55052, -46.63331"
              value={coordSite}
              onChange={(e) => setCoordSite(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 12 entradas por grau (sem texto “ângulos sugeridos”) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            12 FOTOS 360 (do meio da área locada, iniciando no Norte)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {ANGLES_360.map((angle) => (
              <PhotoInput
                key={angle}
                title={`360° – ${angle}`}
                photoKey={`360_meio_${angleKey(angle)}`}
                photos={photos}
                setPhotos={setPhotos}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 12 entradas por grau (sem texto “ângulos sugeridos”) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            12 FOTOS 360 (da frente do imóvel, iniciando no Norte)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {ANGLES_360.map((angle) => (
              <PhotoInput
                key={angle}
                title={`360° – ${angle}`}
                photoKey={`360_frente_${angleKey(angle)}`}
                photos={photos}
                setPhotos={setPhotos}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <GridSection title="Outros">
        <PhotoInput
          title="PANORÂMICA (do mesmo local das 360, iniciando ao Norte)"
          photoKey="panoramica"
          photos={photos}
          setPhotos={setPhotos}
        />
        <PhotoInput
          title="CONTA DE CONCESSIONÁRIA"
          photoKey="conta_concessionaria"
          photos={photos}
          setPhotos={setPhotos}
        />
      </GridSection>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Checkbox id="nao_obrigatorio" defaultChecked />
            <Label htmlFor="nao_obrigatorio" className="text-sm">
              Os dados são salvos automaticamente no seu navegador. Você pode
              prosseguir sem preencher todos os campos.
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}