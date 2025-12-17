import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReportData } from '@/types/report';

interface SecurityProps {
  data: ReportData;
  onChange: (field: string, value: string) => void;
}

export default function Security({ data, onChange }: SecurityProps) {
  const getValue = (field: string) => (data as Record<string, any>)[field];
  const selectClassName =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';

  const renderInputWithNa = (field: string, label: string, placeholder: string) => {
    const isNa = getValue(field) === 'N/A';
    return (
      <div className="space-y-2">
        <Label htmlFor={field}>{label}</Label>
        <Input
          id={field}
          value={isNa ? '' : getValue(field) || ''}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          disabled={isNa}
        />
        <div className="flex items-center space-x-2">
          <Checkbox id={`${field}-na`} checked={isNa} onCheckedChange={(c) => onChange(field, c ? 'N/A' : '')} />
          <Label htmlFor={`${field}-na`}>N/A</Label>
        </div>
      </div>
    );
  };

  const renderYesNo = (field: string, label: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox id={`${field}-sim`} checked={getValue(field) === 'SIM'} onCheckedChange={(c) => onChange(field, c ? 'SIM' : '')} />
          <Label htmlFor={`${field}-sim`}>SIM</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id={`${field}-nao`} checked={getValue(field) === 'NAO'} onCheckedChange={(c) => onChange(field, c ? 'NAO' : '')} />
          <Label htmlFor={`${field}-nao`}>NÃO</Label>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Condições de acesso e segurança</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {renderYesNo('elevador', 'Elevador?')}
          {renderYesNo('escada', 'Escada?')}
          {renderYesNo('utilizacaoGuindaste', 'Possível utilização de guindaste?')}
          {renderYesNo('aberto', 'Aberto?')}

          {renderInputWithNa('especificacoesElevador', 'Especificações do elevador', 'Informe as especificações do elevador')}

          {renderInputWithNa('capacidadePeso', 'Capacidade de peso', 'Informe a capacidade de peso')}

          {renderInputWithNa('possibilidadeIcamento', 'Possibilidade de içamento de equipamento?', 'Informe a possibilidade de içamento')}

          {renderYesNo('estradaAcesso', 'Estrada de acesso existente?')}

          <div className="space-y-2">
            <Label htmlFor="larguraAcesso">Largura</Label>
            <Input
              id="larguraAcesso"
              value={getValue('larguraAcesso') || ''}
              onChange={(e) => onChange('larguraAcesso', e.target.value)}
              placeholder="Informe a largura"
            />
          </div>

          {renderInputWithNa(
            'comprimentoAcessoMelhoria',
            'Se não, determinar comprimento de acesso/melhoria',
            'Informe o comprimento de acesso/melhoria'
          )}

          <div className="space-y-2">
            <Label htmlFor="segurancaLocal">Segurança do local</Label>
            <select
              id="segurancaLocal"
              className={selectClassName}
              value={getValue('segurancaLocal') || ''}
              onChange={(e) => onChange('segurancaLocal', e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="PUBLICA">Pública</option>
              <option value="PRIVADA">Privada</option>
            </select>
          </div>

          {renderInputWithNa(
            'dimensoesPassagem',
            'Dimensões (metros) H x L x C - passagem H x L',
            'Informe as dimensões da passagem'
          )}

          {renderYesNo('estacionamentoDisponivel', 'Estacionamento disponível?')}
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold">Comentários adicionais</div>
          {renderYesNo('comentariosAdicionais', 'Comentários adicionais')}

          <div className="space-y-2">
            <Label htmlFor="comentariosAdicionaisTexto">Comentários adicionais</Label>
            <Input
              id="comentariosAdicionaisTexto"
              value={getValue('comentariosAdicionaisTexto') || ''}
              onChange={(e) => onChange('comentariosAdicionaisTexto', e.target.value)}
              placeholder="Informe os comentários adicionais"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}