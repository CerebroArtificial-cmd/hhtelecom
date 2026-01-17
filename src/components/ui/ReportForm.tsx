import React, { useEffect, useRef, useState } from "react";
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
  const [exporting, setExporting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const formDataRef = useRef(formData);
  const draftIdRef = useRef(draftId);
  const savingDraftRef = useRef(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadDone, setUploadDone] = useState(0);

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

  const uploadFileToStorage = async (file: File): Promise<string> => {
    if (!API_BASE) {
      throw new Error('Backend nao configurado.');
    }
    const siteId = (formDataRef.current as any)?.siteId;
    const presignRes = await fetch(`${API_BASE}/api/uploads/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        content_type: file.type || "application/octet-stream",
        site_id: siteId,
        draft_id: draftIdRef.current,
      }),
    });
    if (!presignRes.ok) {
      const text = await presignRes.text();
      throw new Error(text || "Falha ao gerar URL de upload.");
    }
    const presign = await presignRes.json();
    const uploadRes = await fetch(presign.upload_url, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!uploadRes.ok) {
      throw new Error("Falha ao enviar a foto para o storage.");
    }
    return presign.public_url;
  };

  const handleSaveDraft = async (silent = false) => {
    if (!API_BASE) {
      if (!silent) toast.error('Backend nao configurado. Defina NEXT_PUBLIC_BACKEND_URL.');
      return;
    }
    const currentData = formDataRef.current;
    if (!currentData || Object.keys(currentData).length === 0) {
      return;
    }
    if (savingDraftRef.current) {
      return;
    }
    savingDraftRef.current = true;
    if (!silent) setSavingDraft(true);
    try {
      const payload = await serializeForExport(currentData, { includeFileData: false });
      const currentDraftId = draftIdRef.current;
      const res = await fetch(`${API_BASE}/api/rascunhos${currentDraftId ? `/${currentDraftId}` : ''}`, {
        method: currentDraftId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, status: 'draft', timestamp_iso: new Date().toISOString() }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('Draft error:', res.status, text);
        if (!silent) toast.error('Falha ao salvar rascunho.');
        return;
      }
      const data = await res.json();
      if (data?.id) setDraftId(data.id);
      if (!silent) toast.success('Rascunho salvo no servidor.');
    } catch (err) {
      console.error(err);
      if (!silent) toast.error('Erro ao salvar rascunho.');
    } finally {
      savingDraftRef.current = false;
      if (!silent) setSavingDraft(false);
    }
  };

  const handleLoadDraft = async () => {
    if (!API_BASE) {
      toast.error('Backend nao configurado. Defina NEXT_PUBLIC_BACKEND_URL.');
      return;
    }
    setLoadingDraft(true);
    try {
      const siteId = (formData as any)?.siteId;
      const url = siteId
        ? `${API_BASE}/api/rascunhos/ultimo?site_id=${encodeURIComponent(siteId)}`
        : `${API_BASE}/api/rascunhos/ultimo`;
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        console.error('Draft load error:', res.status, text);
        toast.error('Rascunho nao encontrado.');
        return;
      }
      const data = await res.json();
      const payload = data?.payload || {};
      setFormData(payload);
      if (data?.id) setDraftId(data.id);
      setActiveTab('inicio');
      toast.success('Rascunho carregado.');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar rascunho.');
    } finally {
      setLoadingDraft(false);
    }
  };

  useEffect(() => {
    const id = setInterval(() => {
      void handleSaveDraft(true);
    }, 10000);
    return () => clearInterval(id);
  }, [API_BASE]);

  const handleSubmit = async () => {
    if (!API_BASE) {
      toast.error('Backend n?o configurado. Defina NEXT_PUBLIC_BACKEND_URL.');
      return;
    }
    const siteId = (formData as any)?.siteId;
    if (!siteId || String(siteId).trim() === "") {
      toast.error('Informe o siteId antes de enviar.');
      return;
    }
    const photosPayload = (formData as any).photosUploads || {};
    const totalUploads = Object.values(photosPayload).reduce((sum: number, entry: any) => {
      const urls: string[] = entry?.urls || [];
      const files: File[] = entry?.files || [];
      if (urls.length > 0) return sum;
      return sum + files.length;
    }, 0);
    setUploading(true);
    setUploadTotal(totalUploads);
    setUploadDone(0);
    try {
      const photos: any = {};
      const ph = (formData as any).photosUploads || {};
      for (const key of Object.keys(ph)) {
        const entry = ph[key] || {};
        const urls: string[] = (entry as any).urls || [];
        const files: File[] = (entry as any).files || [];
        let images: string[] = [];
        if (urls.length > 0) {
          images = [...urls];
        } else if (files.length > 0) {
          const uploaded = await Promise.all(
            files.map(async (f) => {
              const url = await uploadFileToStorage(f);
              setUploadDone((prev) => prev + 1);
              return url;
            })
          );
          images = uploaded;
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
        toast.error('Falha ao enviar Relat?rio');
        console.error('Backend error:', res.status, text);
        return;
      }
      toast.success('Relat?rio enviado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar. Verifique sua conex?o.');
    } finally {
      setUploading(false);
      setUploadTotal(0);
      setUploadDone(0);
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
        ['resumoNegocia??o'],
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
  const idx = order.indexOf(activeTab as any);
  const uploadPct = uploadTotal > 0 ? Math.round((uploadDone / uploadTotal) * 100) : 0;
  const handleTabChange = (value: string) => {
    if (uploading) return;
    setActiveTab(value);
  };

  return (
    <div className="safe-top safe-bottom">
      <div className="mx-auto w-full max-w-[var(--app-max)] px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {uploading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="rounded-lg bg-white px-5 py-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                <div className="text-sm text-gray-800">
                  Enviando... {uploadTotal > 0 ? `${uploadDone}/${uploadTotal}` : ""}
                </div>
              </div>
            </div>
          </div>
        )}
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-lg sm:text-2xl">Relat?rio de Buscas</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Progresso: {pct}% completo
                </p>
              </div>

              <div className="hidden sm:flex gap-2 sm:gap-3 sm:justify-end">
                <Button type="button" variant="outline" onClick={handleClear} className="h-9">
                  Limpar
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLoadDraft}
                  disabled={loadingDraft || uploading}
                  className="h-9"
                >
                  {loadingDraft ? "Carregando..." : "Carregar rascunho"}
                </Button>

                <Button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={savingDraft || uploading}
                  className="h-9 bg-[#6b7280] hover:bg-[#4b5563] text-white"
                >
                  {savingDraft ? "Salvando..." : "Salvar rascunho"}
                </Button>

                <Button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting || uploading}
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
            {uploading && uploadTotal > 0 && (
              <div className="mt-2">
                <div className="h-2 w-full bg-amber-100 rounded">
                  <div
                    className="h-full rounded bg-amber-500 transition-[width] duration-200"
                    style={{ width: `${uploadPct}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-amber-700">
                  Enviando fotos: {uploadDone}/{uploadTotal}
                </p>
              </div>
            )}
            <div className="mt-2 flex justify-end sm:hidden">
              <Button
                type="button"
                variant="outline"
                onClick={handleLoadDraft}
                disabled={loadingDraft || uploading}
                className="h-8 px-3 text-xs"
              >
                {loadingDraft ? "Carregando..." : "Carregar rascunho"}
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <div className="w-full overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] sm:overflow-visible">
                <TabsList className="flex w-max gap-0 sm:w-full sm:gap-0">
                  <TabsTrigger disabled={uploading} className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="inicio">Informa??es</TabsTrigger>
                  <TabsTrigger disabled={uploading} className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="documentation">Documenta??o</TabsTrigger>
                  <TabsTrigger disabled={uploading} className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="infrastructure">Infraestrutura</TabsTrigger>
                  <TabsTrigger disabled={uploading} className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="security">Seguran?a</TabsTrigger>
                  <TabsTrigger disabled={uploading} className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="photos">Fotos</TabsTrigger>
                  <TabsTrigger disabled={uploading} className="whitespace-nowrap min-w-[120px] sm:min-w-0 sm:flex-1 sm:justify-center" value="rules">Observa??es</TabsTrigger>
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
                  Revise os dados (n?o ? obrigat?rio preencher todos os campos) e envie o Relat?rio.
                </p>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={uploading}
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
                    disabled={uploading}
                  >
                    {uploading ? "Enviando..." : "Enviar"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Preencha os campos e avance; o envio ocorre no final.
                </p>
                {uploading && (
                  <p className="text-xs text-amber-700">
                    Upload em andamento. Aguarde a conclus?o.
                    {uploadTotal > 0 ? ` (${uploadDone}/${uploadTotal})` : ""}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 justify-end">
                  {idx > 0 && (
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      disabled={uploading}
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
                    disabled={uploading || order.indexOf(activeTab as any) >= order.length - 1}
                  >
                    Pr?ximo
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
              <Button variant="outline" className="h-11 w-1/3" onClick={handleClear} disabled={uploading}>
                Limpar
              </Button>

              <Button
                className="h-11 w-1/3 bg-[#6b7280] hover:bg-[#4b5563] text-white"
                onClick={handleSaveDraft}
                disabled={savingDraft || uploading}
              >
                {savingDraft ? "Salvando..." : "Rascunho"}
              </Button>

              <Button
                className="h-11 w-1/3 bg-[#0f766e] hover:bg-[#0c5f59] text-white"
                onClick={handleExport}
                disabled={exporting || uploading}
              >
                {exporting ? "Exportando..." : "Exportar"}
              </Button>
            </div>
          </div>

          {/* espa?o para n?o cobrir o conte?do */}
          <div className="h-[96px]" />
        </div>
      </div>
    </div>
  );
}
