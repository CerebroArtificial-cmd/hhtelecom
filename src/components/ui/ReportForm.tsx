import React, { useState, useEffect, useRef } from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ReportData } from '@/types/report';
import BasicInfo from './BasicInfo';
import Documentation from './Documentation';
import Infrastructure from './Infrastructure';
import Security from './Security';
import PhotoChecklist from './PhotoChecklist';
import RulesSection from './RulesSection';
import { clearAllPhotos } from '@/lib/idb';

async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ReportForm() {
  const API_BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');

  const [formData, setFormData] = useState<ReportData>({});
  const [activeTab, setActiveTab] = useState('inicio');
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const importRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('visitReport');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    setIsOnline(navigator.onLine);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  const handleFieldChange = (
    field: string,
    value: string | boolean | string[] | Record<string, boolean> | Record<string, any>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem('visitReport', JSON.stringify(formData));
    toast.success('RelatÃ³rio salvo com sucesso!');
    setSaving(false);
  };

  const handleClear = async () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados?')) {
      setFormData({});
      localStorage.removeItem('visitReport');
      await clearAllPhotos();
      toast.success('Dados limpos com sucesso!');
    }
  };

  const serializeForExport = async (data: ReportData) => {
    const copy: any = JSON.parse(JSON.stringify(data || {}));
    const ph = (data as any).photosUploads || {};
    const outPhotos: Record<string, any> = {};
    for (const key of Object.keys(ph)) {
      const entry = ph[key] || {};
      if (entry.urls && entry.urls.length > 0) {
        outPhotos[key] = { ...entry, urls: entry.urls };
      } else if (entry.files && entry.files.length > 0) {
        const urls: string[] = [];
        for (const f of entry.files as File[]) urls.push(await fileToDataURL(f));
        outPhotos[key] = { ...entry, urls, files: undefined };
      } else {
        outPhotos[key] = entry;
      }
    }
    copy.photosUploads = outPhotos;
    return copy;
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const payload = await serializeForExport(formData);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "relatorio.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Exportado como JSON.');
    } catch (e: any) {
      console.error(e);
      toast.error('Falha ao exportar JSON.');
    }
    setExporting(false);
  };

  const handleImportClick = () => {
    importRef.current?.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      setFormData(json);
      localStorage.setItem('visitReport', JSON.stringify(json));
      toast.success('Dados importados com sucesso!');
    } catch (e: any) {
      console.error(e);
      toast.error('Falha ao importar JSON.');
    } finally {
      if (importRef.current) importRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!isOnline) {
      toast.error('Voce esta offline. Envio indisponivel.');
      return;
    }
    if (!API_BASE) {
      toast.error('Backend nao configurado. Defina NEXT_PUBLIC_BACKEND_URL.');
      return;
    }
    try {
      const photos: any = {};
      const ph = (formData as any).photosUploads || {};
      for (const key of Object.keys(ph)) {
        const entry = ph[key] || {};
        const urls: string[] = (entry as any).urls || [];
        const files: File[] = (entry as any).files || [];
        const images: string[] = [];
        if (urls.length > 0) {
          images.push(...urls);
        } else {
          for (const f of files) {
            images.push(await fileToDataURL(f));
          }
        }
        photos[key] = { images, coords: entry.coords };
      }

      const res = await fetch(`${API_BASE}/api/relatorios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, photosUploads: photos, timestamp_iso: new Date().toISOString() }),
      });
      if (!res.ok) {
        const text = await res.text();
        toast.error('Falha ao enviar RelatÃ³rio');
        console.error('Backend error:', res.status, text);
        return;
      }
      toast.success('RelatÃ³rio enviado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar. Verifique sua conexÃ£o.');
    }
  };

  const isFieldFilled = (value: unknown) => {
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'boolean') return value as boolean;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      try { return Object.values(value as any).some((v) => !!v); } catch { return false; }
    }
    return false;
  };

  const progressGroups: string[][] = [
    ['siteId'],
    ['hunter'],
    ['operadora'],
    ['searchingRing'],
    ['sharing'],
    ['dataVisita'],
    ['siteType'],
    ['cidade'],
    ['telefone'],
    ['proprietario'],
    ['representante'],
    ['cand'],
    ['cord'],
    ['enderecoSite'],
    ['bairro'],
    ['cep'],
    ['enderecoPropriet?rio', 'enderecoPropriet?rioStatus'],
    ['cepPropriet?rio'],
    ['telefonePropriet?rio'],
    ['bairroPropriet?rio'],
    ['cidadePropriet?rio'],
    ['estadoPropriet?rio'],
    ['enderecoRepresentante', 'enderecoRepresentanteStatus'],
    ['cepRepresentante', 'cepRepresentanteStatus'],
    ['telefoneRepresentante', 'telefoneRepresentanteStatus'],
    ['bairroRepresentante', 'bairroRepresentanteStatus'],
    ['cidadeRepresentante', 'cidadeRepresentanteStatus'],
    ['estadoRepresentante', 'estadoRepresentanteStatus'],
    ['tipoPessoa'],
    ['relacaoPropriet?rio'],
    ['tipoPropriedade'],
    ['estadoConservacao'],
    ['edificacaoExistente'],
    ['precisaDemolir'],
    ['responsavelDemolicao'],
    ['areaLivreUtilizada'],
    ['dimensoes?reaDisponivel'],
    ['tipoEntorno'],
    ['supressaoVegetacao'],
    ['responsavelSupressao'],
    ['outraOperadora500m'],
    ['proprietarioImovelEstrutura'],
    ['operadorasRaio500m'],
    ['restricaoAcesso'],
    ['resumoNegocia??o'],
    ['observacoes'],
    ['iptu'],
    ['itr'],
    ['iptuItr'],
    ['escrituraParticular'],
    ['contratoCompraVenda'],
    ['matriculaCartorio'],
    ['escrituraPublica'],
    ['inventario'],
    ['contaConcessionaria'],
    ['docFoto1'],
    ['docFoto2'],
    ['docFoto3'],
    ['docFoto4'],
    ['tempoDocumento'],
    ['telefoneDoc'],
    ['proposta'],
    ['contraProposta'],
    ['resumoHistorico'],
    ['equipamentosEdificacao'],
    ['projetosEdificacaoDisponiveis'],
    ['localizacaoSala'],
    ['salaDesocupada'],
    ['equipamentosPesadosProximos'],
    ['arCondicionadoVentilacao'],
    ['outrosProjetos'],
    ['dimensoesSala'],
    ['areaLivreDimensoes'],
    ['numeroJanelasSala'],
    ['equipamentoTopoEdificacao'],
    ['alturaEdificacao'],
    ['numeroPavimentos'],
    ['plantasConstrucao'],
    ['sistemaAterramentoCentral'],
    ['numeroUnidades'],
    ['numeroUnidadesDoisTercos'],
    ['espacoEstocarEquipamentos'],
    ['passagemCabo'],
    ['localIndicado'],
    ['terrenoPlano'],
    ['arvore?rea'],
    ['construcao?rea'],
    ['medidas?rea'],
    ['coordenadasPontoNominal'],
    ['energia'],
    ['numeroTrafo'],
    ['numeroMedidor'],
    ['energiaOrigem'],
    ['privadaPermiteUso'],
    ['extensaoRede'],
    ['metrosExtensao'],
    ['motivoExtensaoAdequacao'],
    ['energiaTipo'],
    ['energiaVoltagem'],
    ['potenciaTrafo'],
    ['espacoGerador'],
    ['adequacaoCentroMedicao'],
    ['concessionariaEnergia'],
    ['elevador'],
    ['escada'],
    ['utilizacaoGuindaste'],
    ['aberto'],
    ['especificacoesElevador'],
    ['capacidadePeso'],
    ['possibilidadeIcamento'],
    ['estradaAcesso'],
    ['larguraAcesso'],
    ['comprimentoAcessoMelhoria'],
    ['segurancaLocal'],
    ['dimensoesPassagem'],
    ['estacionamentoDisponivel'],
    ['comentariosAdicionais'],
    ['comentariosAdicionaisTexto'],
    ['regraRodovia40'],
    ['regraRio50'],
    ['regraColegio50'],
    ['regraHospital50'],
    ['regraAreaLivre'],
    ['regraArvoresEspecie'],
    ['regrasObs'],
  ];

  const getCompletionPercentage = () => {
    if (!formData || Object.keys(formData).length === 0) return 0;
    const totalFields = progressGroups.length;
    const filledFields = progressGroups.filter((group) =>
      group.some((field) => isFieldFilled((formData as any)[field]))
    ).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  const order = ["inicio", "documentation", "infrastructure", "security", "photos", "rules"] as const;
  const pct = getCompletionPercentage();
  const idx = order.indexOf(activeTab as any);
  const isOnlineSafe = mounted ? isOnline : true;

  return (
    <div className="safe-top safe-bottom">
      <div className="mx-auto w-full max-w-[var(--app-max)] px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-lg sm:text-2xl">RelatÃ³rio de Buscas</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Progresso: {pct}% completo
                </p>

                {!isOnlineSafe && (
                  <p className="text-xs text-amber-700 mt-1">
                    VocÃª estÃ¡ offline. Ã‰ possÃ­vel salvar/exportar, mas nÃ£o enviar.
                  </p>
                )}
              </div>

              <div className="hidden sm:flex gap-2 sm:gap-3 sm:justify-end">
                <Button type="button" variant="outline" onClick={handleClear} className="h-9">
                  Limpar
                </Button>

                <Button
                  type="button"
                  onClick={handleSave}
                  className="h-9 flex-1 sm:flex-none bg-[#D9452F] hover:bg-[#bf3a29] text-white"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </Button>

                <Button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="h-9 bg-[#0f766e] hover:bg-[#0c5f59] text-white"
                >
                  {exporting ? "Exportando..." : "Exportar"}
                </Button>
              </div>
            </div>

            <div className="mt-2 h-2 w-full bg-gray-200 rounded">
              <div
                className="h-full rounded"
                style={{ width: `${pct}%`, backgroundColor: "#77807a" }}
              />
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="w-full overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] sm:overflow-visible">
                <TabsList className="flex w-max gap-0 sm:w-full sm:gap-0">
                  <TabsTrigger className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="inicio">InformaÃ§Ãµes</TabsTrigger>
                  <TabsTrigger className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="documentation">DocumentaÃ§Ã£o</TabsTrigger>
                  <TabsTrigger className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="infrastructure">Infraestrutura</TabsTrigger>
                  <TabsTrigger className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="security">SeguranÃ§a</TabsTrigger>
                  <TabsTrigger className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="photos">Fotos</TabsTrigger>
                  <TabsTrigger className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="rules">ObservaÃ§Ãµes</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="inicio">
                <BasicInfo data={formData} onChange={handleFieldChange} />
              </TabsContent>

              <TabsContent value="documentation">
                <Documentation data={formData} onChange={handleFieldChange} />
              </TabsContent>

              <TabsContent value="infrastructure">
                <Infrastructure data={formData} onChange={handleFieldChange} />
              </TabsContent>

              <TabsContent value="security">
                <Security data={formData} onChange={handleFieldChange} />
              </TabsContent>

              <TabsContent value="photos">
                <PhotoChecklist data={formData} onChange={handleFieldChange} />
              </TabsContent>

              <TabsContent value="rules">
                <RulesSection data={formData as any} onChange={handleFieldChange} />
              </TabsContent>

            </Tabs>

            {activeTab === "rules" ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Revise os dados (nÃ£o Ã© obrigatÃ³rio preencher todos os campos) e envie o RelatÃ³rio.
                </p>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      const i = order.indexOf(activeTab as any);
                      if (i > 0) setActiveTab(order[i - 1]);
                    }}
                  >
                    Voltar
                  </Button>

                  <Button
                    className="bg-[#D9452F] hover:bg-[#bf3a29] text-white w-full sm:w-auto"
                    onClick={handleSubmit}
                    disabled={!isOnlineSafe}
                  >
                    Enviar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Os dados sÃ£o salvos automaticamente no seu navegador. VocÃª pode prosseguir sem preencher todos os campos.
                </p>
                <div className="flex flex-wrap gap-2 justify-end">
                  {idx > 0 && (
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        const i = order.indexOf(activeTab as any);
                        if (i > 0) setActiveTab(order[i - 1]);
                      }}
                    >
                      Anterior
                    </Button>
                  )}

                  <Button
                    className="bg-[#D9452F] hover:bg-[#bf3a29] text-white w-full sm:w-auto"
                    onClick={() => {
                      const i = order.indexOf(activeTab as any);
                      if (i < order.length - 1) setActiveTab(order[i + 1]);
                    }}
                    disabled={order.indexOf(activeTab as any) >= order.length - 1}
                  >
                    PrÃ³ximo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Barra fixa (mobile) - manter dentro do wrapper max-w */}
        <div className="sm:hidden">
          <div className="fixed left-0 right-0 bottom-0 safe-bottom bg-background/95 backdrop-blur border-t">
            <div className="mx-auto max-w-[var(--app-max)] px-3 py-3 flex gap-2">
              <Button variant="outline" className="h-11 w-1/3" onClick={handleClear}>
                Limpar
              </Button>

              <Button
                className="h-11 w-1/3 bg-[#D9452F] hover:bg-[#bf3a29] text-white"
                onClick={handleSave}
              >
                {saving ? "Salvando..." : "Salvar"}
              </Button>

              <Button
                className="h-11 w-1/3 bg-[#0f766e] hover:bg-[#0c5f59] text-white"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? "Exportando..." : "Exportar"}
              </Button>
            </div>
          </div>

          {/* espaÃ§o para nÃ£o cobrir o conteÃºdo */}
          <div className="h-[96px]" />
        </div>
      </div>
    </div>
  );
}





