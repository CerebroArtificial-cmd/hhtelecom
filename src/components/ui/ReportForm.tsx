import React, { useEffect, useRef, useState, useCallback } from "react";

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

import {

  upsertReport,

  upsertPhotos,

  deletePhotosByReport,

  OfflinePhoto,

  OfflineReport,

} from '@/lib/offlineStore';

import { syncPending } from '@/lib/sync';



async function fileToDataURL(file: File): Promise<string> {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));

    reader.onerror = reject;

    reader.readAsDataURL(file);

  });

}



const TOTAL_PHOTOS_TARGET = 93;



function countPhotos(data: ReportData) {

  const ph = (data as any)?.photosUploads || {};

  let count = 0;

  for (const key of Object.keys(ph)) {

    const entry = ph[key] || {};

    const files = entry.files || [];

    const urls = entry.urls || [];

    const names = entry.names || [];

    count += Math.max(files.length, urls.length, names.length);

  }

  return count;

}



function buildPhotoMeta(data: ReportData) {

  const ph = (data as any).photosUploads || {};

  const out: Record<string, any> = {};

  for (const key of Object.keys(ph)) {

    const entry = ph[key] || {};

    const files: File[] = entry.files || [];

    const urls: string[] = entry.urls || [];

    const names: string[] = entry.names || [];

    out[key] = {

      file_names: names.length > 0 ? names : files.map((f) => f.name || `${key}.jpg`),

      urls,

      coords: entry.coords || null,

    };

  }

  return out;

}



function buildPayloadForSync(data: ReportData) {

  const copy: any = { ...(data || {}) };

  copy.photosUploads = buildPhotoMeta(data);

  return copy;

}



function makeOfflinePhotos(reportId: string, data: ReportData, status: "draft" | "pending") {

  const now = new Date().toISOString();

  const ph = (data as any).photosUploads || {};

  const list: OfflinePhoto[] = [];

  for (const key of Object.keys(ph)) {

    const entry = ph[key] || {};

    const files: File[] = entry.files || [];

    const names: string[] = entry.names || [];

    for (const [idx, file] of files.entries()) {

      const nameFromList = names[idx];

      list.push({

        id: crypto.randomUUID(),

        report_id: reportId,

        field_key: key,

        file_name: nameFromList || file.name || `${key}.jpg`,

        blob: file,

        status,

        created_at: now,

        coords: entry.coords || null,

      });

    }

  }

  return list;

}



export default function ReportForm() {

  const [formData, setFormData] = useState<ReportData>({});

  const [activeTab, setActiveTab] = useState('inicio');

  const [exporting, setExporting] = useState(false);

  const [savingDraft, setSavingDraft] = useState(false);

  const [draftId, setDraftId] = useState<string | null>(null);

  const [lastAutoSaveAt, setLastAutoSaveAt] = useState<Date | null>(null);

  const formDataRef = useRef(formData);

  const draftIdRef = useRef(draftId);

  const savingDraftRef = useRef(false);

  const [syncing, setSyncing] = useState(false);

  const [syncTotal, setSyncTotal] = useState(0);

  const [syncDone, setSyncDone] = useState(0);



  useEffect(() => {

    formDataRef.current = formData;

  }, [formData]);



  useEffect(() => {

    draftIdRef.current = draftId;

  }, [draftId]);



  const handleFieldChange = (

    field: string,

    value: string | boolean | string[] | Record<string, boolean> | Record<string, any>

  ) => {

    setFormData((prev) => ({

      ...prev,

      [field]: value,

    }));

  };



  const handleClear = () => {

    if (window.confirm('Tem certeza que deseja limpar todos os dados?')) {

      setFormData({});

      toast.success('Dados limpos com sucesso!');

    }

  };



  const serializeForExport = async (

    data: ReportData,

    options: { includeFileData?: boolean } = {}

  ) => {

    const includeFileData = options.includeFileData ?? true;

    const copy: any = JSON.parse(JSON.stringify(data || {}));

    const ph = (data as any).photosUploads || {};

    const outPhotos: Record<string, any> = {};

    for (const key of Object.keys(ph)) {

      const entry = ph[key] || {};

      if (entry.urls && entry.urls.length > 0) {

        outPhotos[key] = { ...entry, urls: entry.urls, files: undefined };

      } else if (includeFileData && entry.files && entry.files.length > 0) {

        const urls: string[] = [];

        for (const f of entry.files as File[]) urls.push(await fileToDataURL(f));

        outPhotos[key] = { ...entry, urls, files: undefined };

      } else {

        outPhotos[key] = { ...entry, files: undefined };

      }

    }

    copy.photosUploads = outPhotos;

    return copy;

  };



  const handleExport = async () => {

    setExporting(true);

    try {

      const payload = await serializeForExport(formData, { includeFileData: true });

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



  const handleSaveDraft = async (silent = false) => {

    const currentData = formDataRef.current;

    if (!currentData || Object.keys(currentData).length === 0) return;

    if (savingDraftRef.current) return;

    savingDraftRef.current = true;

    if (!silent) setSavingDraft(true);

    try {

      const now = new Date().toISOString();

      const currentDraftId = draftIdRef.current || crypto.randomUUID();

      const payload = buildPayloadForSync(currentData);

      const report: OfflineReport = {

        id: currentDraftId,

        payload_json: JSON.stringify(payload),

        status: "draft",

        created_at: now,

        updated_at: now,

      };

      await upsertReport(report);

      await deletePhotosByReport(currentDraftId);

      const photos = makeOfflinePhotos(currentDraftId, currentData, "draft");

      if (photos.length > 0) await upsertPhotos(photos);

      if (!draftIdRef.current) setDraftId(currentDraftId);

      if (!silent) toast.success('Rascunho salvo no dispositivo.');

      setLastAutoSaveAt(new Date());

    } catch (err) {

      console.error(err);

      if (!silent) toast.error('Erro ao salvar rascunho.');

    } finally {

      savingDraftRef.current = false;

      if (!silent) setSavingDraft(false);

    }

  };



  useEffect(() => {

    const id = setInterval(() => {

      void handleSaveDraft(true);

    }, 10000);

    return () => clearInterval(id);

  }, []);



  const runSync = useCallback(async () => {

    try {

      setSyncing(true);

      setSyncDone(0);

      const res = await syncPending({

        onProgress: (done, total) => {

          setSyncTotal(total);

          setSyncDone(done);

        },

      });

      if (res && res.photos > 0) {

        toast.success('Sincronizacao concluida.');

      }

    } catch (e) {

      console.error(e);

      toast.error('Falha na sincronizacao.');

    } finally {

      setSyncing(false);

      setSyncTotal(0);

      setSyncDone(0);

    }

  }, []);



  useEffect(() => {

    const onOnline = () => void runSync();

    window.addEventListener("online", onOnline);

    return () => window.removeEventListener("online", onOnline);

  }, [runSync]);



  const handleSubmit = async () => {

    const siteId = (formData as any)?.siteId;

    if (!siteId || String(siteId).trim() === "") {

      toast.error('Informe o siteId antes de enviar.');

      return;

    }

    try {

      const now = new Date().toISOString();

      const reportId = draftIdRef.current || crypto.randomUUID();

      const payload = buildPayloadForSync(formData);

      const report: OfflineReport = {

        id: reportId,

        payload_json: JSON.stringify(payload),

        status: "pending",

        created_at: now,

        updated_at: now,

      };

      await upsertReport(report);

      await deletePhotosByReport(reportId);

      const photos = makeOfflinePhotos(reportId, formData, "pending");

      if (photos.length > 0) await upsertPhotos(photos);

      if (!draftIdRef.current) setDraftId(reportId);

      toast.success('Relatorio salvo offline. Sincronizando quando houver internet.');



      if (navigator.onLine) {

        await runSync();

      }

    } catch (err) {

      console.error(err);

      toast.error('Erro ao salvar offline.');

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



  const progressSections: { key: string; groups: string[][] }[] = [

    {

      key: 'inicio',

      groups: [

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

        ['resumoNegociacao'],

        ['observacoes'],

      ],

    },

    {

      key: 'documentation',

      groups: [

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

      ],

    },

    {

      key: 'infrastructure',

      groups: [

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

      ],

    },

    {

      key: 'security',

      groups: [

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

      ],

    },

    {

      key: 'photos',

      groups: [

        ['photosUploads'],

      ],

    },

    {

      key: 'rules',

      groups: [

        ['regraRodovia40'],

        ['regraRio50'],

        ['regraColegio50'],

        ['regraHospital50'],

        ['regraAreaLivre'],

        ['regraArvoresEspecie'],

        ['regrasObs'],

      ],

    },

  ];



  const getCompletionPercentage = () => {

    if (!formData || Object.keys(formData).length === 0) return 0;

    const sectionScores = progressSections.map((section) => {

      const totalGroups = section.groups.length;

      if (totalGroups === 0) return 0;

      const filledGroups = section.groups.filter((group) =>

        group.some((field) => isFieldFilled((formData as any)[field]))

      ).length;

      return filledGroups / totalGroups;

    });

    const total = sectionScores.reduce((sum, score) => sum + score, 0);

    return Math.round((total / progressSections.length) * 100);

  };



  const order = ["inicio", "documentation", "infrastructure", "security", "photos", "rules"] as const;

  const pct = getCompletionPercentage();

  const photoCount = countPhotos(formData);

  const photoPct = Math.min(100, Math.round((photoCount / TOTAL_PHOTOS_TARGET) * 100));

  const idx = order.indexOf(activeTab as any);

  const syncPct = syncTotal > 0 ? Math.round((syncDone / syncTotal) * 100) : 0;

  const handleTabChange = (value: string) => {

    if (syncing) return;

    setActiveTab(value);

  };



  return (

    <div className="safe-top safe-bottom">

      <div className="mx-auto w-full max-w-[var(--app-max)] px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">

        {syncing && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="rounded-lg bg-white px-5 py-4 shadow-lg">

              <div className="flex items-center gap-3">

                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />

                <div className="text-sm text-gray-800">

                  Sincronizando... {syncTotal > 0 ? `${syncDone}/${syncTotal}` : ""}

                </div>

              </div>

            </div>

          </div>

        )}

        <Card className="rounded-2xl shadow-sm">

          <CardHeader>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

              <div>

                <CardTitle className="text-lg sm:text-2xl">Relatório de Buscas</CardTitle>

                <p className="text-sm text-muted-foreground mt-1">

                  Progresso: {pct}% completo

                </p>

                {lastAutoSaveAt && (

                  <p className="text-xs text-muted-foreground mt-1">

                    Rascunho salvo automaticamente as {lastAutoSaveAt.toLocaleTimeString()}

                  </p>

                )}

              </div>



              <div className="hidden sm:flex gap-2 sm:gap-3 sm:justify-end">

                <Button type="button" variant="outline" onClick={handleClear} className="h-9">

                  Limpar

                </Button>



                <Button

                  type="button"

                  onClick={handleSaveDraft}

                  disabled={savingDraft || syncing}

                  className="h-9 bg-[#6b7280] hover:bg-[#4b5563] text-white"

                >

                  {savingDraft ? "Salvando..." : "Salvar rascunho"}

                </Button>



                <Button

                  type="button"

                  onClick={runSync}

                  disabled={syncing}

                  className="h-9 bg-[#1d4ed8] hover:bg-[#1e40af] text-white"

                >

                  {syncing ? "Sincronizando..." : "Sincronizar agora"}

                </Button>



                <Button

                  type="button"

                  onClick={handleExport}

                  disabled={exporting || syncing}

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

            <div className="mt-2">

              <div className="flex items-center justify-between text-xs text-amber-700">

                <span>Fotos: {photoCount}/{TOTAL_PHOTOS_TARGET}</span>

                <span>{photoPct}%</span>

              </div>

              <div className="mt-1 h-2 w-full rounded bg-amber-100">

                <div className="h-full rounded bg-amber-300" style={{ width: `${photoPct}%` }} />

              </div>

            </div>

            {syncing && syncTotal > 0 && (

              <div className="mt-2">

                <div className="h-2 w-full bg-amber-100 rounded">

                  <div

                    className="h-full rounded bg-amber-500 transition-[width] duration-200"

                    style={{ width: `${syncPct}%` }}

                  />

                </div>

                <p className="mt-1 text-xs text-amber-700">

                  Enviando fotos: {syncDone}/{syncTotal}

                </p>

              </div>

            )}

          </CardHeader>



          <CardContent>

            <Tabs value={activeTab} onValueChange={handleTabChange}>

              <div className="w-full overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] sm:overflow-visible">

                <TabsList className="flex w-max gap-0 sm:w-full sm:gap-0">

                  <TabsTrigger disabled={syncing} className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="inicio">Informações</TabsTrigger>

                  <TabsTrigger disabled={syncing} className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="documentation">Documentação</TabsTrigger>

                  <TabsTrigger disabled={syncing} className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="infrastructure">Infraestrutura</TabsTrigger>

                  <TabsTrigger disabled={syncing} className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="security">Segurança</TabsTrigger>

                  <TabsTrigger disabled={syncing} className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="photos">Fotos</TabsTrigger>

                  <TabsTrigger disabled={syncing} className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="rules">Observações</TabsTrigger>

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

                <PhotoChecklist data={formData} onChange={handleFieldChange} onAutoSave={handleSaveDraft} />

              </TabsContent>



              <TabsContent value="rules">

                <RulesSection data={formData as any} onChange={handleFieldChange} />

              </TabsContent>



            </Tabs>



            {activeTab === "rules" ? (

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                <p className="text-sm text-muted-foreground">

                  Revise os dados (não é obrigatório preencher todos os campos) e envie o Relatório.

                </p>

                <div className="flex flex-wrap gap-2 justify-end">

                  <Button

                    variant="outline"

                    className="w-full sm:w-auto"

                    disabled={syncing}

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

                    disabled={syncing}

                  >

                    {syncing ? "Enviando..." : "Enviar"}

                  </Button>

                </div>

              </div>

            ) : (

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                <p className="text-sm text-muted-foreground">

                  Preencha os campos e avance; o envio ocorre no final.

                </p>

                {syncing && (

                  <p className="text-xs text-amber-700">

                    Upload em andamento. Aguarde a conclusão.

                    {syncTotal > 0 ? ` (${syncDone}/${syncTotal})` : ""}

                  </p>

                )}

                <div className="flex flex-wrap gap-2 justify-end">

                  {idx > 0 && (

                    <Button

                      variant="outline"

                      className="w-full sm:w-auto"

                      disabled={syncing}

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

                    disabled={syncing || order.indexOf(activeTab as any) >= order.length - 1}

                  >

                    Próximo

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

              <Button variant="outline" className="h-11 w-1/4" onClick={handleClear} disabled={syncing}>

                Limpar

              </Button>



              <Button

                className="h-11 w-1/4 bg-[#6b7280] hover:bg-[#4b5563] text-white"

                onClick={handleSaveDraft}

                disabled={savingDraft || syncing}

              >

                {savingDraft ? "Salvando..." : "Rascunho"}

              </Button>



              <Button

                className="h-11 w-1/4 bg-[#1d4ed8] hover:bg-[#1e40af] text-white"

                onClick={runSync}

                disabled={syncing}

              >

                {syncing ? "Sync..." : "Sync"}

              </Button>



              <Button

                className="h-11 w-1/4 bg-[#0f766e] hover:bg-[#0c5f59] text-white"

                onClick={handleExport}

                disabled={exporting || syncing}

              >

                {exporting ? "Exportando..." : "Exportar"}

              </Button>

            </div>

          </div>



          {/* espaço para não cobrir o conteúdo */}

          <div className="h-[96px]" />

        </div>

      </div>

    </div>

  );

}


