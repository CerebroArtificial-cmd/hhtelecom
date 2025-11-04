import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ReportData } from '@/types/report';

interface BasicInfoProps {
  data: ReportData;
  onChange: (field: string, value: string | boolean) => void;
}

export default function BasicInfo({ data, onChange }: BasicInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Site</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ID do site e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="siteId">ID do site</Label>
            <Input id="siteId" value={data.siteId || ''} onChange={(e) => onChange('siteId', e.target.value)} placeholder="Ex.: 123456" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataVisita">Data</Label>
            <Input id="dataVisita" value={data.dataVisita || ''} onChange={(e) => onChange('dataVisita', e.target.value)} placeholder="DD/MM/AAAA" />
          </div>
        </div>

        {/* Tipo de Site */}
        <div className="space-y-2">
          <Label>Tipo de Site</Label>
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <Checkbox id="greenfield" checked={data.siteType === 'greenfield'} onCheckedChange={(c) => onChange('siteType', c ? 'greenfield' : '')} />
              <Label htmlFor="greenfield">Greenfield</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="rooftop" checked={data.siteType === 'rooftop'} onCheckedChange={(c) => onChange('siteType', c ? 'rooftop' : '')} />
              <Label htmlFor="rooftop">Rooftop</Label>
            </div>
          </div>
        </div>

        {/* Cidade e Telefone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" value={data.cidade || ''} onChange={(e) => onChange('cidade', e.target.value)} placeholder="Nome da cidade" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" value={data.telefone || ''} onChange={(e) => onChange('telefone', e.target.value)} placeholder="Telefone do proprietário" />
          </div>
        </div>

        {/* Proprietário e Representante */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="proprietario">Proprietário</Label>
            <Input id="proprietario" value={data.proprietario || ''} onChange={(e) => onChange('proprietario', e.target.value)} placeholder="Nome do proprietário" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="representante">Representante</Label>
            <Input id="representante" value={data.representante || ''} onChange={(e) => onChange('representante', e.target.value)} placeholder="Nome do representante" />
          </div>
        </div>

        {/* CAND e CORD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cand">CAND</Label>
            <Input id="cand" value={data.cand || ''} onChange={(e) => onChange('cand', e.target.value)} placeholder="CAND" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cord">CORD</Label>
            <Input id="cord" value={data.cord || ''} onChange={(e) => onChange('cord', e.target.value)} placeholder="CORD" />
          </div>
        </div>

        {/* Endereço do Site, Bairro e CEP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="enderecoSite">Endereço do Site</Label>
            <Input id="enderecoSite" value={data.enderecoSite || ''} onChange={(e) => onChange('enderecoSite', e.target.value)} placeholder="Endereço do site" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" value={data.bairro || ''} onChange={(e) => onChange('bairro', e.target.value)} placeholder="Nome do bairro" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" value={data.cep || ''} onChange={(e) => onChange('cep', e.target.value)} placeholder="Ex.: 00000-000" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
