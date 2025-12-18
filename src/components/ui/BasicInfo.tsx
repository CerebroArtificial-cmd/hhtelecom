import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReportData } from '@/types/report';

interface BasicInfoProps {
  data: ReportData;
  onChange: (field: string, value: string | boolean) => void;
}

export default function BasicInfo({ data, onChange }: BasicInfoProps) {
  const getValue = (field: string) => (data as Record<string, any>)[field];
  const selectClassName =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm';
  const requiredLabelClassName = 'inline-flex items-center gap-1';
  const requiredMarkerClassName = 'text-red-600';

  const isEmpty = (value: unknown) => {
    if (typeof value === 'string') return value.trim() === '';
    return value === undefined || value === null || value === '';
  };

  const renderStatusN?Options = (field: string, options: { value: string; label: string }[]) => (
    <div className="flex flex-wrap gap-4">
      {options.map((opt) => (
        <div key={opt.value} className="flex items-center space-x-2">
          <Checkbox
            id={`${field}-${opt.value}`}
            checked={getValue(field) === opt.value}
            onCheckedChange={(c) => onChange(field, c ? opt.value : 'INFN?ORMAR')}
          />
          <Label htmlFor={`${field}-${opt.value}`}>{opt.label}</Label>
        </div>
      ))}
    </div>
  );

  const statusDisablesInput = (field: string) => {
    const status = getValue(field);
    return status && status !== 'INFN?ORMAR';
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
          <Checkbox id={`${field}-nao`} checked={getValue(field) === 'NAN?O'} onCheckedChange={(c) => onChange(field, c ? 'NAN?O' : '')} />
          <Label htmlFor={`${field}-nao`}>NÃN?O</Label>
        </div>
      </div>
    </div>
  );

  const renderRequiredLabel = (htmlFor: string, label: string) => (
    <Label htmlFor={htmlFor} className={requiredLabelClassName}>
      {label}
      <span className={requiredMarkerClassName}>*</span>
    </Label>
  );

  const renderRequiredMessage = (value: unknown) =>
    isEmpty(value) ? <p className="text-xs text-red-600">Preenchimento obrigatório</p> : null;

  const renderYesNoNa = (field: string, label: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox id={`${field}-sim`} checked={getValue(field) === 'SIM'} onCheckedChange={(c) => onChange(field, c ? 'SIM' : '')} />
          <Label htmlFor={`${field}-sim`}>SIM</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id={`${field}-nao`} checked={getValue(field) === 'NAN?O'} onCheckedChange={(c) => onChange(field, c ? 'NAN?O' : '')} />
          <Label htmlFor={`${field}-nao`}>NÃN?O</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id={`${field}-na`} checked={getValue(field) === 'NA'} onCheckedChange={(c) => onChange(field, c ? 'NA' : '')} />
          <Label htmlFor={`${field}-na`}>N/A</Label>
        </div>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Informa??es do Site</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="text-sm font-semibold">Dados gerais</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteId">ID do site</Label>
                <Input id="siteId" value={data.siteId || ''} onChange={(e) => onChange('siteId', e.target.value)} placeholder="Informe o ID do site" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hunter">Hunter</Label>
                <Input id="hunter" value={getValue('hunter') || ''} onChange={(e) => onChange('hunter', e.target.value)} placeholder="Informe o seu nome" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operadora">Operadora</Label>
                <select
                  id="operadora"
                  className={selectClassName}
                  value={getValue('operadora') || ''}
                  onChange={(e) => onChange('operadora', e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="VIVO">Vivo</option>
                  <option value="CLARO">Claro</option>
                  <option value="TIM">Tim</option>
                  <option value="OI">Oi</option>
                  <option value="ALGAR_TELECOM">Algar Telecom</option>
                  <option value="SERCOMTEL">Sercomtel</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>A ?rea est? dentro do searching ring?</Label>
                <div className="flex space-x-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="searchingRing-sim" checked={getValue('searchingRing') === 'SIM'} onCheckedChange={(c) => onChange('searchingRing', c ? 'SIM' : '')} />
                    <Label htmlFor="searchingRing-sim">Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="searchingRing-nao" checked={getValue('searchingRing') === 'NAO'} onCheckedChange={(c) => onChange('searchingRing', c ? 'NAO' : '')} />
                    <Label htmlFor="searchingRing-nao">N?o</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 md:w-1/2">
            <Label htmlFor="sharing">Sharing</Label>
            <select
              id="sharing"
              className={selectClassName}
              value={getValue('sharing') || ''}
              onChange={(e) => onChange('sharing', e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="WINITY">WINITY</option>
              <option value="IHS">IHS</option>
              <option value="CENTENNIAL">CENTENNIAL</option>
              <option value="NEXUS">NEXUS</option>
              <option value="ATC">ATC</option>
              <option value="SBA">SBA</option>
              <option value="TBSA">TBSA</option>
              <option value="DTB">DTB</option>
              <option value="HIGHLINE">HIGHLINE</option>
              <option value="BTC">BTC</option>
              <option value="FIBRASIL">FIBRASIL</option>
              <option value="QMC / QUEST">QMC / QUEST</option>
              <option value="GLOBAL">GLOBAL</option>
            </select>
          </div>
<div className="space-y-2">
              <Label htmlFor="operadora">N?OPERADN?ORA</Label>
              <select
                id="operadora"
                className={selectClassName}
                value={getValue('operadora') || ''}
                onChange={(e) => onChange('operadora', e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="VIVN?O">Vivo</option>
                <option value="CLARN?O">Claro</option>
                <option value="TIM">Tim</option>
                <option value="N?OI">N?Oi</option>
                <option value="ALGAR_TELECN?OM">Algar Telecom</option>
                <option value="SERCN?OMTEL">Sercomtel</option>
                <option value="ARQIA">Arqia</option>
                <option value="SURF">Surf</option>
                <option value="NLT">NLT</option>
                <option value="TELECALL">Telecall</option>
                <option value="VERN?O">Vero</option>
                <option value="UNIFIQUE">Unifique</option>
                <option value="BRISANET">Brisanet</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 md:w-1/3">
            <Label htmlFor="dataVisita">Data</Label>
            <Input id="dataVisita" value={data.dataVisita || ''} onChange={(e) => onChange('dataVisita', e.target.value)} placeholder="Informe a data (DD/MM/AAAA)" />
          </div>

          <div className="space-y-2">
          <Label>Tipo de site</Label>
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox id="greenfield" checked={data.siteType === 'greenfield'} onCheckedChange={(c) => onChange('siteType', c ? 'greenfield' : '')} />
                <Label htmlFor="greenfield">Greenfield</Label>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <Checkbox id="rooftop" checked={data.siteType === 'rooftop'} onCheckedChange={(c) => onChange('siteType', c ? 'rooftop' : '')} />
                  <Label htmlFor="rooftop">Rooftop</Label>
                </div>
                {data.siteType === 'rooftop' && (
                  <span className="text-xs text-muted-foreground pl-6">Enviar fotos RT.</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" value={data.cidade || ''} onChange={(e) => onChange('cidade', e.target.value)} placeholder="Informe a cidade" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={data.telefone || ''} onChange={(e) => onChange('telefone', e.target.value)} placeholder="Informe o telefone" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proprietario">Proprietário</Label>
              <Input id="proprietario" value={data.proprietario || ''} onChange={(e) => onChange('proprietario', e.target.value)} placeholder="Informe o nome do proprietário" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="representante">Representante</Label>
              <Input id="representante" value={data.representante || ''} onChange={(e) => onChange('representante', e.target.value)} placeholder="Informe o nome do representante" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cand">CANDIDATN?O</Label>
              <Input id="cand" value={data.cand || ''} onChange={(e) => onChange('cand', e.target.value)} placeholder="Informe o CANDIDATN?O" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cord">CN?ON?ORDENADA</Label>
              <Input id="cord" value={data.cord || ''} onChange={(e) => onChange('cord', e.target.value)} placeholder="Informe a CN?ON?ORDENADA" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="enderecoSite">Endereço do site</Label>
              <Input id="enderecoSite" value={data.enderecoSite || ''} onChange={(e) => onChange('enderecoSite', e.target.value)} placeholder="Informe o endereço do site" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input id="bairro" value={data.bairro || ''} onChange={(e) => onChange('bairro', e.target.value)} placeholder="Informe o bairro" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <Input id="cep" value={data.cep || ''} onChange={(e) => onChange('cep', e.target.value)} placeholder="Informe o CEP" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold">Dados do proprietário e representante</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-sm font-semibold">Proprietário</div>
              <div className="space-y-2">
                <Label htmlFor="enderecoProprietario">Endereço do proprietário</Label>
                <Input
                  id="enderecoProprietario"
                  value={getValue('enderecoProprietario') || ''}
                  onChange={(e) => onChange('enderecoProprietario', e.target.value)}
                  placeholder="Informe o endereço do proprietário"
                  disabled={statusDisablesInput('enderecoProprietarioStatus')}
                />
                {renderStatusN?Options('enderecoProprietarioStatus', [{ value: 'NI', label: 'N/I' }])}
              </div>

              <div className="space-y-2">
                {renderRequiredLabel('cepProprietario', 'CEP do proprietário')}
                <Input
                  id="cepProprietario"
                  value={getValue('cepProprietario') || ''}
                  onChange={(e) => onChange('cepProprietario', e.target.value)}
                  placeholder="Informe o CEP do proprietário"
                />
                {renderRequiredMessage(getValue('cepProprietario'))}
              </div>

              <div className="space-y-2">
                {renderRequiredLabel('telefoneProprietario', 'Telefone do proprietário')}
                <Input
                  id="telefoneProprietario"
                  value={getValue('telefoneProprietario') || ''}
                  onChange={(e) => onChange('telefoneProprietario', e.target.value)}
                  placeholder="Informe o telefone do proprietário"
                />
                {renderRequiredMessage(getValue('telefoneProprietario'))}
              </div>

              <div className="space-y-2">
                {renderRequiredLabel('bairroProprietario', 'Bairro do proprietário')}
                <Input
                  id="bairroProprietario"
                  value={getValue('bairroProprietario') || ''}
                  onChange={(e) => onChange('bairroProprietario', e.target.value)}
                  placeholder="Informe o bairro do proprietário"
                />
                {renderRequiredMessage(getValue('bairroProprietario'))}
              </div>

              <div className="space-y-2">
                {renderRequiredLabel('cidadeProprietario', 'Cidade do proprietário')}
                <Input
                  id="cidadeProprietario"
                  value={getValue('cidadeProprietario') || ''}
                  onChange={(e) => onChange('cidadeProprietario', e.target.value)}
                  placeholder="Informe a cidade do proprietário"
                />
                {renderRequiredMessage(getValue('cidadeProprietario'))}
              </div>

              <div className="space-y-2">
                {renderRequiredLabel('estadoProprietario', 'Estado do proprietário')}
                <Input
                  id="estadoProprietario"
                  value={getValue('estadoProprietario') || ''}
                  onChange={(e) => onChange('estadoProprietario', e.target.value)}
                  placeholder="Informe o estado do proprietário"
                />
                {renderRequiredMessage(getValue('estadoProprietario'))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-semibold">Representante</div>
              <div className="space-y-2">
                <Label htmlFor="enderecoRepresentante">Endereço do representante</Label>
                <Input
                  id="enderecoRepresentante"
                  value={getValue('enderecoRepresentante') || ''}
                  onChange={(e) => onChange('enderecoRepresentante', e.target.value)}
                  placeholder="Informe o endereço do representante"
                  disabled={statusDisablesInput('enderecoRepresentanteStatus')}
                />
                {renderStatusN?Options('enderecoRepresentanteStatus', [
                  { value: 'NI', label: 'N/I' },
                  { value: 'NA', label: 'N/A' },
                ])}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cepRepresentante">CEP do representante</Label>
                <Input
                  id="cepRepresentante"
                  value={getValue('cepRepresentante') || ''}
                  onChange={(e) => onChange('cepRepresentante', e.target.value)}
                  placeholder="Informe o CEP do representante"
                  disabled={statusDisablesInput('cepRepresentanteStatus')}
                />
                {renderStatusN?Options('cepRepresentanteStatus', [
                  { value: 'NI', label: 'N/I' },
                  { value: 'NA', label: 'N/A' },
                ])}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefoneRepresentante">Telefone do representante</Label>
                <Input
                  id="telefoneRepresentante"
                  value={getValue('telefoneRepresentante') || ''}
                  onChange={(e) => onChange('telefoneRepresentante', e.target.value)}
                  placeholder="Informe o telefone do representante"
                  disabled={statusDisablesInput('telefoneRepresentanteStatus')}
                />
                {renderStatusN?Options('telefoneRepresentanteStatus', [
                  { value: 'NI', label: 'N/I' },
                  { value: 'NA', label: 'N/A' },
                ])}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bairroRepresentante">Bairro do representante</Label>
                <Input
                  id="bairroRepresentante"
                  value={getValue('bairroRepresentante') || ''}
                  onChange={(e) => onChange('bairroRepresentante', e.target.value)}
                  placeholder="Informe o bairro do representante"
                  disabled={statusDisablesInput('bairroRepresentanteStatus')}
                />
                {renderStatusN?Options('bairroRepresentanteStatus', [
                  { value: 'NI', label: 'N/I' },
                  { value: 'NA', label: 'N/A' },
                ])}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidadeRepresentante">Cidade do representante</Label>
                <Input
                  id="cidadeRepresentante"
                  value={getValue('cidadeRepresentante') || ''}
                  onChange={(e) => onChange('cidadeRepresentante', e.target.value)}
                  placeholder="Informe a cidade do representante"
                  disabled={statusDisablesInput('cidadeRepresentanteStatus')}
                />
                {renderStatusN?Options('cidadeRepresentanteStatus', [
                  { value: 'NI', label: 'N/I' },
                  { value: 'NA', label: 'N/A' },
                ])}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estadoRepresentante">Estado do representante</Label>
                <Input
                  id="estadoRepresentante"
                  value={getValue('estadoRepresentante') || ''}
                  onChange={(e) => onChange('estadoRepresentante', e.target.value)}
                  placeholder="Informe o estado do representante"
                  disabled={statusDisablesInput('estadoRepresentanteStatus')}
                />
                {renderStatusN?Options('estadoRepresentanteStatus', [
                  { value: 'NI', label: 'N/I' },
                  { value: 'NA', label: 'N/A' },
                ])}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold">Classificação</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              {renderRequiredLabel('tipoPessoa', 'Tipo de pessoa')}
              <select
                id="tipoPessoa"
                className={selectClassName}
                value={getValue('tipoPessoa') || ''}
                onChange={(e) => onChange('tipoPessoa', e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="FISICA">Física</option>
                <option value="JURIDICA">Jurídica</option>
                <option value="N?ORGAN?O_PUBLICN?O">Órgão público</option>
              </select>
              {renderRequiredMessage(getValue('tipoPessoa'))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="relacaoProprietario">Relação com proprietário</Label>
              <select
                id="relacaoProprietario"
                className={selectClassName}
                value={getValue('relacaoProprietario') || ''}
                onChange={(e) => onChange('relacaoProprietario', e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="IRMAN?O">Irmão</option>
                <option value="FILHN?O">Filho</option>
                <option value="PRIMN?O">Primo</option>
                <option value="N?OUTRN?O">N?Outro</option>
                <option value="NA">N/A</option>
              </select>
            </div>

            <div className="space-y-2">
              {renderRequiredLabel('tipoPropriedade', 'Tipo de propriedade')}
              <select
                id="tipoPropriedade"
                className={selectClassName}
                value={getValue('tipoPropriedade') || ''}
                onChange={(e) => onChange('tipoPropriedade', e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="TERREN?O_URBAN?O">Terreno urbano</option>
                <option value="TERREN?O_RURAL">Terreno rural</option>
                <option value="AREA_PUBLICA">Área pública</option>
                <option value="TN?OPN?O_PREDIN?O_SN?OBRADN?O">Topo de prédio/sobrado</option>
              </select>
              {renderRequiredMessage(getValue('tipoPropriedade'))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estadoConservacao">Estado de conservação</Label>
              <select
                id="estadoConservacao"
                className={selectClassName}
                value={getValue('estadoConservacao') || ''}
                onChange={(e) => onChange('estadoConservacao', e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="BN?OM">Bom</option>
                <option value="REGULAR">Regular</option>
                <option value="PESSIMN?O">Péssimo</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold">Edificação e área</div>
          <div className="space-y-2">
            <Label className={requiredLabelClassName}>
              Edificação existente?
              <span className={requiredMarkerClassName}>*</span>
            </Label>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="edificacaoExistente-sim" checked={getValue('edificacaoExistente') === 'SIM'} onCheckedChange={(c) => onChange('edificacaoExistente', c ? 'SIM' : '')} />
                <Label htmlFor="edificacaoExistente-sim">SIM</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="edificacaoExistente-nao" checked={getValue('edificacaoExistente') === 'NAN?O'} onCheckedChange={(c) => onChange('edificacaoExistente', c ? 'NAN?O' : '')} />
                <Label htmlFor="edificacaoExistente-nao">NÃN?O</Label>
              </div>
            </div>
            {renderRequiredMessage(getValue('edificacaoExistente'))}
          </div>
          {renderYesNoNa('precisaDemolir', 'Precisa ser demolida?')}

          <div className="space-y-2">
            <Label htmlFor="responsavelDemolicao">Responsável pela demolição</Label>
            <select
              id="responsavelDemolicao"
              className={selectClassName}
              value={getValue('responsavelDemolicao') || ''}
              onChange={(e) => onChange('responsavelDemolicao', e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="LN?OCADN?OR">Locador</option>
              <option value="SHARING">Sharing</option>
              <option value="NA">N/A</option>
            </select>
          </div>

          {renderYesNoNa('areaLivreUtilizada', 'Área (terreno) livre? Será utilizada?')}

          <div className="space-y-2">
            <Label htmlFor="dimensoesAreaDisponivel">Dimensões da área disponível</Label>
            <Input
              id="dimensoesAreaDisponivel"
              value={getValue('dimensoesAreaDisponivel') || ''}
              onChange={(e) => onChange('dimensoesAreaDisponivel', e.target.value)}
              placeholder="Informe as dimensões da área disponível"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoEntorno">Tipo de entorno</Label>
            <select
              id="tipoEntorno"
              className={selectClassName}
              value={getValue('tipoEntorno') || ''}
              onChange={(e) => onChange('tipoEntorno', e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="CN?OMERCIAL">Comercial</option>
              <option value="RESIDENCIAL">Residencial</option>
              <option value="INDUSTRIAL">Industrial</option>
              <option value="MISTN?O">Misto</option>
              <option value="N?OUTRN?O">N?Outro</option>
            </select>
          </div>

          {renderYesNo('supressaoVegetacao', 'Supressão de vegetação?')}

          <div className="space-y-2">
            <Label htmlFor="responsavelSupressao">Responsável</Label>
            <select
              id="responsavelSupressao"
              className={selectClassName}
              value={getValue('responsavelSupressao') || ''}
              onChange={(e) => onChange('responsavelSupressao', e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="LN?OCADN?OR">Locador</option>
              <option value="SHARING">Sharing</option>
              <option value="NA">N/A</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold">N?Operadoras e acesso</div>
          {renderYesNo('outraN?Operadora500m', 'N?Outra operadora no raio de 500 m?')}
          {renderYesNo('proprietarioImovelEstrutura', 'Proprietário do imóvel e/ou estrutura?')}

          <div className="space-y-2">
            <Label htmlFor="operadorasRaio500m">Quais operadoras no raio de 500 m?</Label>
              <select
                id="operadorasRaio500m"
                className={selectClassName}
                value={getValue('operadorasRaio500m') || ''}
                onChange={(e) => onChange('operadorasRaio500m', e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="VIVN?O">Vivo</option>
                <option value="CLARN?O">Claro</option>
                <option value="TIM">TIM</option>
                <option value="N?OI">N?Oi</option>
                <option value="ALGAR_TELECN?OM">Algar Telecom</option>
                <option value="SERCN?OMTEL">Sercomtel</option>
                <option value="ARQIA">Arqia</option>
                <option value="SURF">Surf</option>
                <option value="NLT">NLT</option>
                <option value="TELECALL">Telecall</option>
                <option value="VERN?O">Vero</option>
                <option value="UNIFIQUE">Unifique</option>
                <option value="BRISANET">Brisanet</option>
                <option value="NA">N/A</option>
              </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="restricaoAcesso">Restrições de acesso e disponibilidade 24x7</Label>
            <Textarea
              id="restricaoAcesso"
              value={getValue('restricaoAcesso') || ''}
              onChange={(e) => onChange('restricaoAcesso', e.target.value)}
              placeholder="Informe as restrições de acesso e disponibilidade"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold">Negociação e observações</div>
          <div className="space-y-2">
            <Label htmlFor="resumoNegociacao">Resumo sobre a negociação</Label>
            <Textarea
              id="resumoNegociacao"
              value={getValue('resumoNegociacao') || ''}
              onChange={(e) => onChange('resumoNegociacao', e.target.value)}
              placeholder="Informe o resumo da negociação"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">N?Observações (ex.: exigências do proprietário, cobertura, telefone fixo)</Label>
            <Textarea
              id="observacoes"
              value={getValue('observacoes') || ''}
              onChange={(e) => onChange('observacoes', e.target.value)}
              placeholder="Informe as observações"
              rows={3}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
