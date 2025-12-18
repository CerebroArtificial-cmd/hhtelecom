import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReportData } from '@/types/report';

interface InfrastructureProps {
  data: ReportData;
  onChange: (field: string, value: string | string[]) => void;
}

export default function Infrastructure({ data, onChange }: InfrastructureProps) {
  const getValue = (field: string) => (data as Record<string, any>)[field];

  const toggleArray = (field: string, value: string) => {
    const current = getValue(field);
    const arr = Array.isArray(current) ? current : current ? [String(current)] : [];
    const exists = arr.includes(value);
    const next = exists ? arr.filter((v) => v !== value) : [...arr, value];
    onChange(field, next);
  };

  const energiaTipos = Array.isArray(getValue('energiaTipo'))
    ? (getValue('energiaTipo') as string[])
    : getValue('energiaTipo')
      ? [String(getValue('energiaTipo'))]
      : [];

  const renderYesNo = (field: string, label: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`${field}Sim`}
            checked={getValue(field) === 'sim'}
            onCheckedChange={(c) => onChange(field, c ? 'sim' : '')}
          />
          <Label htmlFor={`${field}Sim`}>SIM</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`${field}Nao`}
            checked={getValue(field) === 'nao'}
            onCheckedChange={(c) => onChange(field, c ? 'nao' : '')}
          />
          <Label htmlFor={`${field}Nao`}>NÃO</Label>
        </div>
      </div>
    </div>
  );

  const renderInputWithStatus = (field: string, label: string, placeholder: string, statusValue: 'N/A' | 'N/I') => {
    const isStatus = getValue(field) === statusValue;
    return (
      <div className="space-y-2">
        <Label htmlFor={field}>{label}</Label>
        <Input
          id={field}
          value={isStatus ? '' : getValue(field) || ''}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          disabled={isStatus}
        />
        <div className="flex items-center space-x-2">
          <Checkbox id={`${field}-${statusValue}`} checked={isStatus} onCheckedChange={(c) => onChange(field, c ? statusValue : '')} />
          <Label htmlFor={`${field}-${statusValue}`}>{statusValue}</Label>
        </div>
      </div>
    );
  };

  const renderTextareaWithStatus = (field: string, label: string, placeholder: string, statusValue: 'N/A' | 'N/I') => {
    const isStatus = getValue(field) === statusValue;
    return (
      <div className="space-y-2">
        <Label htmlFor={field}>{label}</Label>
        <Textarea
          id={field}
          value={isStatus ? '' : getValue(field) || ''}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          rows={3}
          disabled={isStatus}
        />
        <div className="flex items-center space-x-2">
          <Checkbox id={`${field}-${statusValue}`} checked={isStatus} onCheckedChange={(c) => onChange(field, c ? statusValue : '')} />
          <Label htmlFor={`${field}-${statusValue}`}>{statusValue}</Label>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Infraestrutura</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="text-sm font-semibold">Casos de salas</div>
          {renderTextareaWithStatus(
            'equipamentosEdificacao',
            'Em casos de salas: equipamentos dentro da edificação existente',
            'Informe os equipamentos dentro da edificação existente',
            'N/A'
          )}
          {renderInputWithStatus(
            'projetosEdificacaoDisponiveis',
            'Projetos de edificação disponíveis',
            'Informe os projetos de edificação disponíveis',
            'N/A'
          )}
          {renderInputWithStatus('localizacaoSala', 'Localização da sala', 'Informe a localização da sala', 'N/A')}
          {renderInputWithStatus('salaDesocupada', 'Sala desocupada?', 'Informe se a sala está desocupada', 'N/A')}
          {renderInputWithStatus(
            'equipamentosPesadosProximos',
            'Equipamentos pesados próximos?',
            'Informe se há equipamentos pesados próximos',
            'N/A'
          )}
          {renderInputWithStatus(
            'arCondicionadoVentilacao',
            'Ar condicionado/Ventilação mecânica existente?',
            'Informe se existe ar condicionado/ventilação mecânica',
            'N/A'
          )}
          {renderInputWithStatus('outrosProjetos', 'Outros projetos?', 'Informe outros projetos', 'N/A')}
          {renderInputWithStatus('dimensoesSala', 'Dimensões da sala (H x L x C)', 'Informe as dimensões da sala', 'N/A')}
          {renderInputWithStatus(
            'areaLivreDimensoes',
            'Dimensionar área livre (H x L x C)',
            'Informe as dimensões da área livre',
            'N/A'
          )}
          {renderInputWithStatus('numeroJanelasSala', 'Número de janelas na sala', 'Informe o número de janelas', 'N/A')}
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold">Casos de RT</div>
          {renderInputWithStatus(
            'equipamentoTopoEdificacao',
            'Em casos de RT: equipamento no topo da edificação existente',
            'Informe o equipamento no topo da edificação existente',
            'N/A'
          )}
          {renderInputWithStatus('alturaEdificacao', 'Altura da edificação', 'Informe a altura da edificação', 'N/A')}
          {renderInputWithStatus('numeroPavimentos', 'Número de pavimentos (andar)', 'Informe o número de pavimentos', 'N/A')}
          {renderInputWithStatus('plantasConstrucao', 'Plantas da construção?', 'Informe as plantas da construção', 'N/A')}
          {renderInputWithStatus(
            'sistemaAterramentoCentral',
            'Sistema de aterramento central?',
            'Informe o sistema de aterramento central',
            'N/A'
          )}
          {renderInputWithStatus('numeroUnidades', 'Número de unidades (aptos/salas)', 'Informe o número de unidades', 'N/A')}
          {renderInputWithStatus('numeroUnidadesDoisTercos', 'Número de unidades = 2/3', 'Informe o número de unidades (2/3)', 'N/A')}
          {renderInputWithStatus(
            'espacoEstocarEquipamentos',
            'Há espaço para estocar equipamentos?',
            'Informe se há espaço para estocar equipamentos',
            'N/A'
          )}
          {renderInputWithStatus(
            'passagemCabo',
            'Existe local para passagem de cabo',
            'Informe o local para passagem de cabo',
            'N/A'
          )}
          {renderInputWithStatus('localIndicado', 'Local indicado', 'Informe o local indicado', 'N/A')}
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold">Infraestrutura geral</div>
          {renderYesNo('terrenoPlano', 'Terreno plano?')}
          {renderYesNo('arvoreArea', 'Tem árvore na área locada?')}
          {renderYesNo('construcaoArea', 'Tem construção na área locada?')}

          <div className="space-y-2">
            <Label htmlFor="medidasArea">Medidas da área locada</Label>
            <Input
              id="medidasArea"
              value={getValue('medidasArea') || ''}
              onChange={(e) => onChange('medidasArea', e.target.value)}
              placeholder="Informe as medidas da área (ex.: 10 m x 15 m)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resumoHistorico">Resumo do histórico do imóvel</Label>
            <Textarea
              id="resumoHistorico"
              value={getValue('resumoHistorico') || ''}
              onChange={(e) => onChange('resumoHistorico', e.target.value)}
              placeholder="Informe o resumo do histórico do imóvel"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coordenadasPontoNominal">Coordenadas do ponto nominal</Label>
            <Input
              id="coordenadasPontoNominal"
              value={getValue('coordenadasPontoNominal') || ''}
              onChange={(e) => onChange('coordenadasPontoNominal', e.target.value)}
              placeholder="Informe as coordenadas (ex.: -23.55052, -46.63331)"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold">Energia disponível</div>
          {renderYesNo('energia', 'Energia elétrica disponível?')}

          {renderInputWithStatus('numeroTrafo', 'Número do trafo', 'Informe o número do trafo', 'N/I')}
          {renderInputWithStatus('numeroMedidor', 'Número do medidor', 'Informe o número do medidor', 'N/I')}

          <div className="space-y-2">
            <Label htmlFor="energiaOrigem">Energia é da concessionária ou privada?</Label>
            <Input
              id="energiaOrigem"
              value={getValue('energiaOrigem') || ''}
              onChange={(e) => onChange('energiaOrigem', e.target.value)}
              placeholder="Informe se é da concessionária ou privada"
            />
          </div>

          {renderYesNo('privadaPermiteUso', 'Se privada, o proprietário permite o uso?')}
          {renderYesNo('extensaoRede', 'Necessidade de extensão de rede/adequação?')}

          <div className="space-y-2">
            <Label htmlFor="metrosExtensao">Se sim, determinar distância de extensão/adequação</Label>
            <Input
              id="metrosExtensao"
              value={getValue('metrosExtensao') || ''}
              onChange={(e) => onChange('metrosExtensao', e.target.value)}
              placeholder="Informe a distância"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivoExtensaoAdequacao">Se sim, determinar motivo de extensão/adequação</Label>
            <Textarea
              id="motivoExtensaoAdequacao"
              value={getValue('motivoExtensaoAdequacao') || ''}
              onChange={(e) => onChange('motivoExtensaoAdequacao', e.target.value)}
              placeholder="Informe o motivo da extensão/adequação"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de energia</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="energiaTipoTri" checked={energiaTipos.includes('tri')} onCheckedChange={() => toggleArray('energiaTipo', 'tri')} />
                <Label htmlFor="energiaTipoTri">Tri</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="energiaTipoMono" checked={energiaTipos.includes('mono')} onCheckedChange={() => toggleArray('energiaTipo', 'mono')} />
                <Label htmlFor="energiaTipoMono">Mono</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="energiaTipoBt" checked={energiaTipos.includes('bt')} onCheckedChange={() => toggleArray('energiaTipo', 'bt')} />
                <Label htmlFor="energiaTipoBt">BT</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="energiaVoltagem">Tensão (V)</Label>
            <Input
              id="energiaVoltagem"
              value={getValue('energiaVoltagem') || ''}
              onChange={(e) => onChange('energiaVoltagem', e.target.value)}
              placeholder="Informe a tensão (V)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="potenciaTrafo">Potência trafo (kVA)</Label>
            <Input
              id="potenciaTrafo"
              value={getValue('potenciaTrafo') || ''}
              onChange={(e) => onChange('potenciaTrafo', e.target.value)}
              placeholder="Informe a potência do trafo (kVA)"
            />
          </div>

          {renderYesNo('espacoGerador', 'Espaço para gerador?')}
          {renderYesNo('adequacaoCentroMedicao', 'Adequação do centro de medição (em caso de rooftop)?')}

          <div className="space-y-2">
            <Label htmlFor="concessionariaEnergia">Qual a concessionária de energia?</Label>
            <Input
              id="concessionariaEnergia"
              value={getValue('concessionariaEnergia') || ''}
              onChange={(e) => onChange('concessionariaEnergia', e.target.value)}
              placeholder="Informe a concessionária de energia"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
