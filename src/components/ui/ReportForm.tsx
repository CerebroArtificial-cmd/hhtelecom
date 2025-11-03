"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ReportData } from '@/types/report';
import BasicInfo from './BasicInfo';
import Documentation from './Documentation';
import Infrastructure from './Infrastructure';
import PhotoChecklist from './PhotoChecklist';
import SketchSection from './SketchSection';
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
  const [formData, setFormData] = useState<ReportData>({});
  const [activeTab, setActiveTab] = useState('inicio');

  useEffect(() => {
    const savedData = localStorage.getItem('visitReport');
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem('visitReport', JSON.stringify(formData));
    }
  }, [formData]);

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
    localStorage.setItem('visitReport', JSON.stringify(formData));
    toast.success('Relatório salvo com sucesso!');
  };

  const handleClear = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados?')) {
      setFormData({});
      localStorage.removeItem('visitReport');
      toast.success('Dados limpos com sucesso!');
    }
  };

  const handleSubmit = async () => {
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

      const res = await fetch('/api/relatorios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, photosUploads: photos, timestamp_iso: new Date().toISOString() }),
      });
      if (!res.ok) {
        const text = await res.text();
        toast.error('Falha ao enviar relatório');
        console.error('Make error:', res.status, text);
        return;
      }
      toast.success('Relatório enviado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao enviar. Verifique sua conexão.');
    }
  };

  const getCompletionPercentage = () => {
    if (!formData || Object.keys(formData).length === 0) return 0;
    const ignored = new Set(['photosUploads', 'timestamp_iso']);
    const values = Object.entries(formData)
      .filter(([k]) => !ignored.has(k as string))
      .map(([, v]) => v);
    const totalFields = 30;
    const filledFields = values.filter((value) => {
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'boolean') return value as boolean;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        try { return Object.values(value as any).some((v) => !!v); } catch { return false; }
      }
      return false;
    }).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  const order = ["inicio", "documentation", "infrastructure", "photos", "rules", "sketch"] as const;
  const pct = getCompletionPercentage();
  const idx = order.indexOf(activeTab as any);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Relatório de Buscas</CardTitle>
              <p className="text-muted-foreground mt-1">Progresso: {pct}% completo</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <Button className="bg-[#054059] hover:bg-[#04364b] text-white w-full sm:w-auto" onClick={handleClear}>Limpar</Button>
              <Button className="bg-[#03571f] hover:bg-[#024a1a] text-white w-full sm:w-auto" onClick={handleSave}>Salvar</Button>
              <Button
                className={`text-white w-full sm:w-auto ${idx < order.length - 1 ? 'bg-[#77807a] hover:bg-[#5f6762]' : 'bg-[#D9452F] hover:bg-[#bf3a29]'}`}
                onClick={handleSubmit}
                disabled={idx < order.length - 1}
              >
                Enviar
              </Button>
            </div>
          </div>
          <div className="mt-2 h-2 w-full bg-gray-200 rounded">
            <div className="h-full rounded" style={{ width: `${pct}%`, backgroundColor: "#77807a" }} />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              <TabsTrigger value="inicio">Informações</TabsTrigger>
              <TabsTrigger value="documentation">Documentação</TabsTrigger>
              <TabsTrigger value="infrastructure">Infraestrutura</TabsTrigger>
              <TabsTrigger value="photos">Fotos</TabsTrigger>
              <TabsTrigger value="rules">Observações</TabsTrigger>
              <TabsTrigger value="sketch">Croqui</TabsTrigger>
            </TabsList>

            <TabsContent value="inicio">
              <BasicInfo data={formData} onChange={handleFieldChange} />
            </TabsContent>

            <TabsContent value="documentation">
              <Documentation data={formData} onChange={handleFieldChange} />
            </TabsContent>

            <TabsContent value="infrastructure">
              <Infrastructure data={formData} onChange={handleFieldChange} />
            </TabsContent>

            <TabsContent value="photos">
              <PhotoChecklist data={formData} onChange={handleFieldChange} />
            </TabsContent>

            <TabsContent value="rules">
              <RulesSection data={formData as any} onChange={handleFieldChange} />
            </TabsContent>

            <TabsContent value="sketch">
              <SketchSection data={formData} onChange={handleFieldChange} />
            </TabsContent>
          </Tabs>

          {activeTab === 'sketch' ? (
            <div className="flex justify-between items-center pt-6">
              <p className="text-sm text-muted-foreground">Revise os dados (não é obrigatório preencher todos os campos) e envie o relatório para a planilha.</p>
              <div className="flex flex-wrap gap-2 justify-end">
                <Button variant="outline" className="w-full sm:w-auto"
                  onClick={() => {
                    const i = order.indexOf(activeTab as any);
                    if (i > 0) setActiveTab(order[i - 1]);
                  }}
                >Voltar</Button>
                <Button className="bg-[#D9452F] hover:bg-[#bf3a29] text-white w-full sm:w-auto" onClick={handleSubmit}>Enviar</Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center pt-6">
              <p className="text-sm text-muted-foreground">Os dados são salvos automaticamente no seu navegador. Você pode prosseguir sem preencher todos os campos.</p>
              <div className="flex flex-wrap gap-2 justify-end">
                {idx > 0 && (
                  <Button variant="outline" className="w-full sm:w-auto"
                    onClick={() => {
                      const i = order.indexOf(activeTab as any);
                      if (i > 0) setActiveTab(order[i - 1]);
                    }}
                  >Anterior</Button>
                )}
                <Button className="bg-[#D9452F] hover:bg-[#bf3a29] text-white w-full sm:w-auto"
                  onClick={() => {
                    const i = order.indexOf(activeTab as any);
                    if (i < order.length - 1) setActiveTab(order[i + 1]);
                  }}
                  disabled={order.indexOf(activeTab as any) >= order.length - 1}
                >Próximo</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
