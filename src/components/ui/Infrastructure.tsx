import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ReportData } from '@/types/report';

interface InfrastructureProps {
  data: ReportData;
  onChange: (field: string, value: string | string[]) => void;
}

export default function Infrastructure({ data, onChange }: InfrastructureProps) {
  const toggleArray = (field: keyof ReportData, value: string) => {
    const arr = (data[field] as string[]) || [];
    const exists = arr.includes(value);
    const next = exists ? arr.filter((v) => v !== value) : [...arr, value];
    onChange(field as string, next);
  };

  const energiaAtiva = data.energia === 'sim';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Infraestrutura</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Terreno plano */}
        <div className="space-y-3">
          <Label>Terreno plano?</Label>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="terrenoPlanoSim" checked={data.terrenoPlano === 'sim'} onCheckedChange={(c) => onChange('terrenoPlano', c ? 'sim' : '')} />
              <Label htmlFor="terrenoPlanoSim">SIM</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="terrenoPlanoNao" checked={data.terrenoPlano === 'nao'} onCheckedChange={(c) => onChange('terrenoPlano', c ? 'nao' : '')} />
              <Label htmlFor="terrenoPlanoNao">NÃO</Label>
            </div>
          </div>
        </div>

        {/* Árvores na área locada */}
        <div className="space-y-3">
          <Label>Tem árvore na área locada?</Label>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="arvoreAreaSim" checked={data.arvoreArea === 'sim'} onCheckedChange={(c) => onChange('arvoreArea', c ? 'sim' : '')} />
              <Label htmlFor="arvoreAreaSim">SIM</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="arvoreAreaNao" checked={data.arvoreArea === 'nao'} onCheckedChange={(c) => onChange('arvoreArea', c ? 'nao' : '')} />
              <Label htmlFor="arvoreAreaNao">NÃO</Label>
            </div>
          </div>
        </div>

        {/* Construção na área locada */}
        <div className="space-y-3">
          <Label>Tem construção na área locada?</Label>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="construcaoAreaSim" checked={data.construcaoArea === 'sim'} onCheckedChange={(c) => onChange('construcaoArea', c ? 'sim' : '')} />
              <Label htmlFor="construcaoAreaSim">SIM</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="construcaoAreaNao" checked={data.construcaoArea === 'nao'} onCheckedChange={(c) => onChange('construcaoArea', c ? 'nao' : '')} />
              <Label htmlFor="construcaoAreaNao">NÃO</Label>
            </div>
          </div>
        </div>

        {/* Medidas da área + Resumo do histórico */}
        <div className="space-y-2">
          <Label htmlFor="medidasArea">Medidas da área locada</Label>
          <Input id="medidasArea" value={data.medidasArea || ''} onChange={(e) => onChange('medidasArea', e.target.value)} placeholder="Ex: 10m x 15m" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="resumoHistorico">Resumo do histórico do imóvel</Label>
          <Textarea id="resumoHistorico" rows={3} value={data.resumoHistorico || ''} onChange={(e) => onChange('resumoHistorico', e.target.value)} placeholder="Descreva o histórico do imóvel" />
        </div>

        {/* Energia no imóvel */}
        <div className="space-y-3">
          <Label>Energia no imóvel?</Label>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="energiaSim" checked={data.energia === 'sim'} onCheckedChange={(c) => onChange('energia', c ? 'sim' : '')} />
              <Label htmlFor="energiaSim">SIM</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="energiaNao" checked={data.energia === 'nao'} onCheckedChange={(c) => onChange('energia', c ? 'nao' : '')} />
              <Label htmlFor="energiaNao">NÃO</Label>
            </div>
          </div>

          {energiaAtiva && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="tipoMono" checked={(data.energiaTipo || []).includes('mono')} onCheckedChange={() => toggleArray('energiaTipo', 'mono')} />
                    <Label htmlFor="tipoMono">Mono</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="tipoBi" checked={(data.energiaTipo || []).includes('bi')} onCheckedChange={() => toggleArray('energiaTipo', 'bi')} />
                    <Label htmlFor="tipoBi">Bi</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="tipoTri" checked={(data.energiaTipo || []).includes('tri')} onCheckedChange={() => toggleArray('energiaTipo', 'tri')} />
                    <Label htmlFor="tipoTri">Tri</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Voltagem</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="vol110" checked={(data.energiaVoltagem || []).includes('110')} onCheckedChange={() => toggleArray('energiaVoltagem', '110')} />
                    <Label htmlFor="vol110">110V</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="vol220" checked={(data.energiaVoltagem || []).includes('220')} onCheckedChange={() => toggleArray('energiaVoltagem', '220')} />
                    <Label htmlFor="vol220">220V</Label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Extensão de rede */}
        <div className="space-y-3">
          <Label>Necessita de extensão de rede?</Label>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="extensaoSim" checked={data.extensaoRede === 'sim'} onCheckedChange={(c) => onChange('extensaoRede', c ? 'sim' : '')} />
              <Label htmlFor="extensaoSim">SIM</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="extensaoNao" checked={data.extensaoRede === 'nao'} onCheckedChange={(c) => onChange('extensaoRede', c ? 'nao' : '')} />
              <Label htmlFor="extensaoNao">NÃO</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="metrosExtensao">Quantos metros?</Label>
            <Input id="metrosExtensao" value={data.metrosExtensao || ''} onChange={(e) => onChange('metrosExtensao', e.target.value)} placeholder="Metros de extensão necessária" />
          </div>
        </div>

        {/* Coordenadas do ponto nominal */}
        <div className="space-y-2">
          <Label htmlFor="coordenadasPontoNominal">Coordenadas do ponto nominal</Label>
          <Input id="coordenadasPontoNominal" value={data.coordenadasPontoNominal || ''} onChange={(e) => onChange('coordenadasPontoNominal', e.target.value)} placeholder="Ex.: -23.55052, -46.63331" />
        </div>
      </CardContent>
    </Card>
  );
}

