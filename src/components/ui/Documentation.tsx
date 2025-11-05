import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ReportData } from '@/types/report';

interface DocumentationProps {
  data: ReportData;
  onChange: (field: string, value: string | boolean) => void;
}

export default function Documentation({ data, onChange }: DocumentationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="iptuItr">IPTU ou ITR?</Label>
          <Input
            id="iptuItr"
            value={data.iptuItr || ''}
            onChange={(e) => onChange('iptuItr', e.target.value)}
            placeholder="Especificar IPTU ou ITR"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="escrituraParticular"
                checked={data.escrituraParticular || false}
                onCheckedChange={(checked) => onChange('escrituraParticular', checked as boolean)}
              />
              <Label htmlFor="escrituraParticular">Contrato/Escritura Particular de Compra e Venda</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="contratoCompraVenda"
                checked={data.contratoCompraVenda || false}
                onCheckedChange={(checked) => onChange('contratoCompraVenda', checked as boolean)}
              />
              <Label htmlFor="contratoCompraVenda">Contrato de Compra e Venda</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="matriculaCartorio"
                checked={data.matriculaCartorio || false}
                onCheckedChange={(checked) => onChange('matriculaCartorio', checked as boolean)}
              />
              <Label htmlFor="matriculaCartorio">Matrícula em Cartório</Label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="escrituraPublica"
                checked={data.escrituraPublica || false}
                onCheckedChange={(checked) => onChange('escrituraPublica', checked as boolean)}
              />
              <Label htmlFor="escrituraPublica">Escritura Pública de Compra e Venda</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="inventario"
                checked={data.inventario || false}
                onCheckedChange={(checked) => onChange('inventario', checked as boolean)}
              />
              <Label htmlFor="inventario">Inventário</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="contaConcessionaria"
                checked={data.contaConcessionaria || false}
                onCheckedChange={(checked) => onChange('contaConcessionaria', checked as boolean)}
              />
              <Label htmlFor="contaConcessionaria">Conta de Concessionária (Tirar foto)</Label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tempoDocumento">Tempo de documento de compra e venda</Label>
          <Input
            id="tempoDocumento"
            value={data.tempoDocumento || ''}
            onChange={(e) => onChange('tempoDocumento', e.target.value)}
            placeholder="Ex: 2 anos, 6 meses"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telefoneDoc">Telefone</Label>
            <Input
              id="telefoneDoc"
              value={data.telefoneDoc || ''}
              onChange={(e) => onChange('telefoneDoc', e.target.value)}
              placeholder="Telefone para documentação"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposta">Proposta (R$)</Label>
            <Input
              id="proposta"
              value={data.proposta || ''}
              onChange={(e) => onChange('proposta', e.target.value)}
              placeholder="Valor da proposta"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contraProposta">Contra Proposta (R$)</Label>
          <Input
            id="contraProposta"
            value={data.contraProposta || ''}
            onChange={(e) => onChange('contraProposta', e.target.value)}
            placeholder="Valor da contra proposta"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="resumoHistorico">Resumo do histórico do imóvel</Label>
          <Textarea
            id="resumoHistorico"
            value={data.resumoHistorico || ''}
            onChange={(e) => onChange('resumoHistorico', e.target.value)}
            placeholder="Descreva o histórico do imóvel"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

