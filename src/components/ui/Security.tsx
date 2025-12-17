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
          <Label htmlFor={`${field}-nao`}>NÃƒO</Label>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Condições de acesso e segurança
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {renderYesNo('elevador', 'Elevador?')}
          {renderYesNo('escada', 'Escada?')}
          {renderYesNo('utilizacaoGuindaste', 'PossÃ­vel utilizaÃ§Ã£o de guindaste?')}
          {renderYesNo('aberto', 'Aberto?')}

          {renderInputWithNa('especificacoesElevador', 'EspecificaÃ§Ãµes do elevador', 'Informe as especificaÃ§Ãµes do elevador')}

          {renderInputWithNa('capacidadePeso', 'Capacidade de peso', 'Informe a capacidade de peso')}

          {renderInputWithNa('possibilidadeIcamento', 'Possibilidade de iÃ§amento de equipamento?', 'Informe a possibilidade de iÃ§amento')}

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
            'Se nÃ£o, determinar comprimento de acesso/melhoria',
            'Informe o comprimento de acesso/melhoria'
          )}

          <div className="space-y-2">
            <Label htmlFor="segurancaLocal">SeguranÃ§a do local</Label>
            <select
              id="segurancaLocal"
              className={selectClassName}
              value={getValue('segurancaLocal') || ''}
              onChange={(e) => onChange('segurancaLocal', e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="PUBLICA">PÃºblica</option>
              <option value="PRIVADA">Privada</option>
            </select>
          </div>

          {renderInputWithNa(
            'dimensoesPassagem',
            'DimensÃµes (metros) H x L x C - passagem H x L',
            'Informe as dimensÃµes da passagem'
          )}

          {renderYesNo('estacionamentoDisponivel', 'Estacionamento disponÃ­vel?')}
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold">ComentÃ¡rios adicionais</div>
          {renderYesNo('comentariosAdicionais', 'ComentÃ¡rios adicionais')}

          <div className="space-y-2">
            <Label htmlFor="comentariosAdicionaisTexto">ComentÃ¡rios adicionais</Label>
            <Input
              id="comentariosAdicionaisTexto"
              value={getValue('comentariosAdicionaisTexto') || ''}
              onChange={(e) => onChange('comentariosAdicionaisTexto', e.target.value)}
              placeholder="Informe os comentÃ¡rios adicionais"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
