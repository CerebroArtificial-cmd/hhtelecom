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
  const fileInputClassName =
    'block w-full cursor-pointer rounded-md border border-gray-300 bg-white p-1 text-xs file:mr-2 file:rounded file:border-0 file:bg-[#77807a] file:hover:bg-[#5f6762] file:px-2 file:py-1 file:text-white';

  const handleDocPhoto = (field: string, fileList: FileList | null) => {
    const file = fileList && fileList[0] ? fileList[0] : undefined;
    if (!file) {
      onChange(field, '');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(field, String(reader.result || ''));
    reader.onerror = () => onChange(field, '');
    reader.readAsDataURL(file);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Documentacao</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>IPTU ou ITR?</Label>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="iptu"
                checked={data.iptu || false}
                onCheckedChange={(checked) => onChange('iptu', checked as boolean)}
              />
              <Label htmlFor="iptu">IPTU</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="itr"
                checked={data.itr || false}
                onCheckedChange={(checked) => onChange('itr', checked as boolean)}
              />
              <Label htmlFor="itr">ITR</Label>
            </div>
          </div>
          <Input
            id="iptuItr"
            value={data.iptuItr || ''}
            onChange={(e) => onChange('iptuItr', e.target.value)}
            placeholder="Observacoes"
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
              <Label htmlFor="matriculaCartorio">Matricula em Cartorio</Label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="escrituraPublica"
                checked={data.escrituraPublica || false}
                onCheckedChange={(checked) => onChange('escrituraPublica', checked as boolean)}
              />
              <Label htmlFor="escrituraPublica">Escritura Publica de Compra e Venda</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="inventario"
                checked={data.inventario || false}
                onCheckedChange={(checked) => onChange('inventario', checked as boolean)}
              />
              <Label htmlFor="inventario">Inventario</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="contaConcessionaria"
                checked={data.contaConcessionaria || false}
                onCheckedChange={(checked) => onChange('contaConcessionaria', checked as boolean)}
              />
              <Label htmlFor="contaConcessionaria">Conta de Concessionaria (Tirar foto)</Label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['docFoto1', 'docFoto2', 'docFoto3', 'docFoto4'].map((field, idx) => (
            <div key={field} className="border rounded p-2">
              <div className="text-xs text-gray-700 mb-1">Foto {idx + 1}</div>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => handleDocPhoto(field, e.target.files)}
                className={fileInputClassName}
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tempoDocumento">Tempo de documento de compra e venda</Label>
          <Input
            id="tempoDocumento"
            value={data.tempoDocumento || ''}
            onChange={(e) => onChange('tempoDocumento', e.target.value)}
            placeholder="Informe o tempo de documento de compra e venda"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telefoneDoc">Telefone</Label>
            <Input
              id="telefoneDoc"
              value={data.telefoneDoc || ''}
              onChange={(e) => onChange('telefoneDoc', e.target.value)}
              placeholder="Informe o telefone para documentacao"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposta">Proposta (R$)</Label>
            <Input
              id="proposta"
              value={data.proposta || ''}
              onChange={(e) => onChange('proposta', e.target.value)}
              placeholder="Informe o valor da proposta"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contraProposta">Contra Proposta (R$)</Label>
          <Input
            id="contraProposta"
            value={data.contraProposta || ''}
            onChange={(e) => onChange('contraProposta', e.target.value)}
            placeholder="Informe o valor da contra proposta"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="resumoHistorico">Resumo do historico do imovel</Label>
          <Textarea
            id="resumoHistorico"
            value={data.resumoHistorico || ''}
            onChange={(e) => onChange('resumoHistorico', e.target.value)}
            placeholder="Informe o historico do imovel"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
