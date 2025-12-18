export type PhotoEntry = {
  files?: File[]; // usado no client (não enviar pro backend)
  urls?: string[]; // dataURL (offline) ou URL gerada no envio
  coordsText?: string; // "-23.550520, -46.633310"
  coords?: { lat: number; lng: number };
};

export type PhotosUploads = Record<string, PhotoEntry>;


/**
 * Dados principais do relatório mapeados 1:1 com o checklist.
 * Campos de duas opções geralmente são radios ("sim" | "nao").
 * Campos com múltiplas opções são arrays (ex.: energiaTipo, energiaVoltagem).
 */
export type ReportData = {
  // ========================
  // INFORMAÇÕES INICIAIS
  // ========================
  siteType?: "greenfield" | "rooftop"; // Greenfield / Rooftop
  operadora?: string;                  // Operadora
  sharing?: string;                    // Sharing
  cidade?: string;                     // CIDADE
  proprietario?: string;               // PROPRIETÁRIO
  telefone?: string;                   // TEL (geral)
  cand?: string;                       // CAND
  cord?: string;                       // CORD
  endereco?: string;                   // ENDEREÇO
  enderecoSite?: string;               // ENDEREÇO DO SITE
  bairro?: string;                     // BAIRRO
  representante?: string;              // REPRESENTANTE

  siteId?: string;                     // ID do site
  dataVisita?: string;                 // Data da visita (DD/MM/AAAA)
  cep?: string;                        // CEP
  // ========================
  // DADOS DO CLIENTE (HUNTER) — Proprietário/Representante com N/I e N/A
  // ========================
  // status helpers
  // src/types/report.ts

export type Status = "INFORMAR" | "NI" | "NA";

export interface ReportData {
  /* ===================== DADOS GERAIS ===================== */
  siteId?: string;
  dataVisita?: string;

  siteType?: "greenfield" | "rooftop";

  cidade?: string;
  telefone?: string;

  proprietario?: string;
  representante?: string;

  cand?: string;
  cord?: string;

  enderecoSite?: string;
  bairro?: string;
  cep?: string;

  /* ===================== STATUS (N/I | N/A) ===================== */
  enderecoProprietarioStatus?: "INFORMAR" | "NI";
  enderecoRepresentanteStatus?: Status;
  cepRepresentanteStatus?: Status;
  telefoneRepresentanteStatus?: Status;
  bairroRepresentanteStatus?: Status;
  cidadeRepresentanteStatus?: Status;
  estadoRepresentanteStatus?: Status;

  /* ===================== PROPRIETÁRIO ===================== */
  enderecoProprietario?: string;
  cepProprietario?: string;
  telefoneProprietario?: string;
  bairroProprietario?: string;
  cidadeProprietario?: string;
  estadoProprietario?: string;

  /* ===================== REPRESENTANTE ===================== */
  enderecoRepresentante?: string;
  cepRepresentante?: string;
  telefoneRepresentante?: string;
  bairroRepresentante?: string;
  cidadeRepresentante?: string;
  estadoRepresentante?: string;

  /* ===================== DROPDOWNS ===================== */
  tipoPessoa?: "FISICA" | "JURIDICA" | "ORGAO_PUBLICO";
  relacaoProprietario?: "IRMAO" | "FILHO" | "PRIMO" | "OUTRO" | "NA";
  tipoPropriedade?: "TERRENO_URBANO" | "TERRENO_RURAL" | "AREA_PUBLICA" | "TOPO_PREDIO_SOBRADO";
  estadoConservacao?: "BOM" | "REGULAR" | "PESSIMO";

  /* ===================== RADIOS ===================== */
  edificacaoExistente?: "SIM" | "NAO";
  precisaDemolir?: "SIM" | "NAO" | "NA";
  responsavelDemolicao?: "LOCADOR" | "SHARING" | "NA";
  areaLivreUtilizada?: "SIM" | "NAO" | "NA";
  dimensoesAreaDisponivel?: string;
  tipoEntorno?: "COMERCIAL" | "RESIDENCIAL" | "INDUSTRIAL" | "MISTO" | "OUTRO";
  supressaoVegetacao?: "SIM" | "NAO";
  responsavelSupressao?: "LOCADOR" | "SHARING" | "NA";
  outraOperadora500m?: "SIM" | "NAO";
  proprietarioImovelEstrutura?: "SIM" | "NAO";
  operadorasRaio500m?: "TIM" | "CLARO" | "VIVO" | "OI" | "OUTRA" | "NA";
  restricaoAcesso?: string;
  resumoNegociacao?: string;
  observacoes?: string;

  /* ===================== INFRAESTRUTURA ===================== */
  equipamentosEdificacao?: string;
  projetosEdificacaoDisponiveis?: string;
  localizacaoSala?: string;
  salaDesocupada?: string;
  equipamentosPesadosProximos?: string;
  arCondicionadoVentilacao?: string;
  outrosProjetos?: string;
  dimensoesSala?: string;
  areaLivreDimensoes?: string;
  numeroJanelasSala?: string;
  equipamentoTopoEdificacao?: string;
  alturaEdificacao?: string;
  numeroPavimentos?: string;
  plantasConstrucao?: string;
  sistemaAterramentoCentral?: string;
  numeroUnidades?: string;
  numeroUnidadesDoisTercos?: string;
  espacoEstocarEquipamentos?: string;
  passagemCabo?: string;
  localIndicado?: string;
  terrenoPlano?: string;
  arvoreArea?: string;
  construcaoArea?: string;
  medidasArea?: string;
  resumoHistorico?: string;
  coordenadasPontoNominal?: string;
  energia?: string;
  energiaTipo?: string[];
  energiaVoltagem?: string;
  extensaoRede?: string;
  metrosExtensao?: string;
  energiaOrigem?: string;
  privadaPermiteUso?: string;
  motivoExtensaoAdequacao?: string;
  numeroTrafo?: string;
  potenciaTrafo?: string;
  numeroMedidor?: string;
  espacoGerador?: string;
  adequacaoCentroMedicao?: string;
  concessionariaEnergia?: string;
  coordenadasTrafo?: string;
  coordenadasMedidor?: string;

  /* ===================== SEGURANCA ===================== */
  elevador?: string;
  escada?: string;
  utilizacaoGuindaste?: string;
  aberto?: string;
  especificacoesElevador?: string;
  capacidadePeso?: string;
  possibilidadeIcamento?: string;
  estradaAcesso?: string;
  larguraAcesso?: string;
  comprimentoAcessoMelhoria?: string;
  segurancaLocal?: "PUBLICA" | "PRIVADA";
  dimensoesPassagem?: string;
  estacionamentoDisponivel?: string;
  comentariosAdicionais?: string;
  comentariosAdicionaisTexto?: string;
  redeSaneamentoComentario?: string;
  possibilidadeComentario?: string;
  retiradaEdificacaoComentario?: string;
  melhoriaAcessoComentario?: string;
  limpezaImovelComentario?: string;
}

/* ===================== DEFAULTS ===================== */
export const emptyReportData: ReportData = {
  siteId: "",
  dataVisita: "",
  siteType: undefined,

  cidade: "",
  telefone: "",
  proprietario: "",
  representante: "",

  cand: "",
  cord: "",

  enderecoSite: "",
  bairro: "",
  cep: "",

  // status defaults
  enderecoProprietarioStatus: "INFORMAR",
  enderecoRepresentanteStatus: "INFORMAR",
  cepRepresentanteStatus: "INFORMAR",
  telefoneRepresentanteStatus: "INFORMAR",
  bairroRepresentanteStatus: "INFORMAR",
  cidadeRepresentanteStatus: "INFORMAR",
  estadoRepresentanteStatus: "INFORMAR",

  // proprietário
  enderecoProprietario: "",
  cepProprietario: "",
  telefoneProprietario: "",
  bairroProprietario: "",
  cidadeProprietario: "",
  estadoProprietario: "",

  // representante
  enderecoRepresentante: "",
  cepRepresentante: "",
  telefoneRepresentante: "",
  bairroRepresentante: "",
  cidadeRepresentante: "",
  estadoRepresentante: "",

  // dropdowns / radios
  tipoPessoa: undefined,
  relacaoProprietario: undefined,
  tipoPropriedade: undefined,
  estadoConservacao: undefined,

  edificacaoExistente: undefined,
  precisaDemolir: undefined,
};

/* ===================== VALIDAÇÃO ===================== */
export function validateReport(data: ReportData): string[] {
  const errors: string[] = [];

  // gerais (se quiser manter)
  if (!data.siteType) errors.push("Tipo de site");
  if (!data.cidade) errors.push("Cidade");
  if (!data.proprietario) errors.push("Proprietário");

  // obrigatórios do cliente
  if (!data.cepProprietario) errors.push("CEP do proprietário");
  if (!data.telefoneProprietario) errors.push("Telefone do proprietário");
  if (!data.bairroProprietario) errors.push("Bairro do proprietário");
  if (!data.cidadeProprietario) errors.push("Cidade do proprietário");
  if (!data.estadoProprietario) errors.push("Estado do proprietário");

  if (!data.tipoPessoa) errors.push("Tipo de pessoa");
  if (!data.tipoPropriedade) errors.push("Tipo de propriedade");

  if (!data.edificacaoExistente) errors.push("Edificação existente");
  if (!data.precisaDemolir) errors.push("Precisa ser demolida");

  return errors;
}
