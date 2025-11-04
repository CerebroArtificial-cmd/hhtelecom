// src/types/report.ts

/**
 * Foto vinculada ao relatório. Pode ter categoria (ex.: "poste", "relógio", "trafo", "site", etc.)
 * e coordenadas GPS específicas daquela foto.
 */
export type PhotoEntry = {
  descricao: string;      // legenda curta exibida na UI
  url: string;            // URL (ou caminho local) da imagem
  gps?: string;           // ex.: "-23.5505, -46.6333" (opcional)
  categoria?: string;     // ex.: "poste", "relógio", "trafo", "acesso", etc. (opcional)
};

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
  // DOCUMENTAÇÃO
  // ========================
  iptuItr?: string;                    // "IPTU" ou "ITR"
  escrituraParticular?: boolean;       // Escritura Particular de Compra e Venda? (SIM/NÃO)
  contratoCompraVenda?: boolean;       // Contrato de Compra e Venda? (SIM/NÃO)
  tempoDocumento?: string;             // Tempo de documento de compra e venda
  matriculaCartorio?: boolean;         // Matrícula em Cartório? (SIM/NÃO)
  escrituraPublica?: boolean;          // Escritura Pública de Compra e Venda? (SIM/NÃO)
  inventario?: boolean;                // Inventário? (SIM/NÃO) | N/A pode ser tratado como false ou string externa
  contaConcessionaria?: boolean;       // Conta de Concessionária? (foto virá em fotos)
  resumoHistorico?: string;            // Resumo do histórico do imóvel
  telefoneDoc?: string;                // TEL (campo na seção documentação)
  proposta?: string;                   // PROPOSTA (R$)
  contraProposta?: string;             // CONTRA-PROPOSTA (R$)

  // ========================
  // INFRA (terreno / energia)
  // ========================
  terrenoPlano?: "sim" | "nao";        // Terreno plano?
  arvoreArea?: "sim" | "nao";          // Tem árvore na área locada?
  construcaoArea?: "sim" | "nao";      // Tem construção na área locada?
  medidasArea?: string;                // Medidas da área locada

  energia?: "sim" | "nao";             // ENERGIA NO IMÓVEL?
  energiaTipo?: ("mono" | "bi" | "tri")[];   // Mono / Bi / Tri (múltipla escolha)
  energiaVoltagem?: ("110" | "220")[];       // 110V / 220V (múltipla escolha)
  extensaoRede?: "sim" | "nao";        // Necessita de extensão de rede?
  metrosExtensao?: string;             // Quantos metros?

  coordenadasPontoNominal?: string;   // Coordenadas do ponto nominal

  // ========================
  // DADOS ELÉTRICOS / COORDENADAS
  // ========================
  coordenadasTrafo?: string;           // Coordenadas do trafo
  numeroTrafo?: string;                // Número do trafo
  potenciaTrafo?: string;              // Potência do trafo
  numeroMedidor?: string;              // Número do medidor
  coordenadasMedidor?: string;         // Coordenadas do medidor

  // ========================
  // CROQUI / OBSERVAÇÕES
  // ========================
  tamanhoTerreno?: string;             // Tamanho total do terreno / local e tamanho da área locada
  vegetacaoExistente?: string;         // Vegetação existente (espécie / localização)
  construcoesTerreno?: string;         // Construções no terreno (dimensões / localização)
  acesso?: string;                     // Acesso (largura, comprimento)
  niveisTerreno?: string;              // Níveis do terreno e da área locada em relação à rua
  observacoesGerais?: string;          // Observações gerais (ex.: distâncias mínimas: rodovia, rio, colégio, hospital)

  // ========================
  // FOTOS (mantidas em outro componente/fluxo)
  // ========================
  fotos?: PhotoEntry[];                // Lista de fotos anexadas (cada uma com descrição/categoria/gps)
};

/**
 * Estrutura final enviada/salva.
 * Você pode acrescentar metadados como usuário, versão, etc.
 */
export type RelatorioChecklistForm = ReportData & {
  timestamp_iso?: string;              // Ex.: new Date().toISOString()
  // userId?: string;
  // versao?: string;
};

// ========================
// OBJETO BASE (formulário vazio)
// ========================
export const emptyReportData: ReportData = {
  siteType: undefined,
  operadora: "",
  sharing: "",
  cidade: "",
  proprietario: "",
  telefone: "",
  cand: "",
  cord: "",
  endereco: "",
  enderecoSite: "",
  bairro: "",
  representante: "",

  siteId: "",
  dataVisita: "",
  cep: "",
  iptuItr: "",
  escrituraParticular: false,
  contratoCompraVenda: false,
  tempoDocumento: "",
  matriculaCartorio: false,
  escrituraPublica: false,
  inventario: false,
  contaConcessionaria: false,
  resumoHistorico: "",
  telefoneDoc: "",
  proposta: "",
  contraProposta: "",

  terrenoPlano: undefined,
  arvoreArea: undefined,
  construcaoArea: undefined,
  medidasArea: "",

  energia: undefined,
  energiaTipo: [],
  energiaVoltagem: [],
  extensaoRede: undefined,
  metrosExtensao: "",
  coordenadasPontoNominal: "",

  coordenadasTrafo: "",
  numeroTrafo: "",
  potenciaTrafo: "",
  numeroMedidor: "",
  coordenadasMedidor: "",

  tamanhoTerreno: "",
  vegetacaoExistente: "",
  construcoesTerreno: "",
  acesso: "",
  niveisTerreno: "",
  observacoesGerais: "",

  fotos: [],
};

// ========================
// FUNÇÃO DE VALIDAÇÃO
// ========================
export function validateReport(data: ReportData): string[] {
  const errors: string[] = [];

  // campos essenciais para submissão
  if (!data.siteType) errors.push("Tipo de site (Greenfield/Rooftop)");
  if (!data.operadora) errors.push("Operadora");
  if (!data.cidade) errors.push("Cidade");
  if (!data.proprietario) errors.push("Proprietário");
  if (!data.telefone) errors.push("Telefone");
  if (!data.enderecoSite) errors.push("Endereço do site");
  if (!data.representante) errors.push("Representante");

  // infraestrutura básica
  if (!data.terrenoPlano) errors.push("Terreno plano (Sim/Não)");
  if (!data.energia) errors.push("Energia no imóvel (Sim/Não)");
  if (data.energia === "sim" && data.energiaTipo?.length === 0)
    errors.push("Tipo de energia (Mono/Bi/Tri)");
  if (data.extensaoRede === "sim" && !data.metrosExtensao)
    errors.push("Metros de extensão de rede");

  // pelo menos 1 foto
  if (!data.fotos || data.fotos.length === 0)
    errors.push("É necessário anexar ao menos uma foto");

  return errors;
}


// ======== Tipos do payload de envio (centralizados) ========
// src/types/report.d.ts

export type DocumentoSN = "SIM" | "NAO" | "NA";
export type SimNao = "SIM" | "NAO";

export type FotosItem = {
  foto_item: string;
  arquivo_url: string;
  gps_lat?: string;
  gps_lng?: string;
  observacao?: string;
  zebrado_aplicado?: SimNao;
};

export type InicioSecao = {
  Greenfield: SimNao;
  Rooftop: SimNao;
  Operadora?: string;
  Sharing: SimNao;

  Cidade?: string;

  Proprietario?: string;
  Proprietario_Telefone?: string;

  CAND?: string;
  CORD?: string;

  Site_ID?: string;
  Data_Visita?: string;
  Endereco_Site?: string;
  Endereco_Logradouro?: string;
  Endereco_Numero?: string;
  Endereco_Complemento?: string;
  Endereco_Bairro?: string;
  Endereco_Cidade?: string;
  Endereco_UF?: string;
  Endereco_CEP?: string;

  Representante?: string;

  Proposta_R$?: string | number;
  ContraProposta_R$?: string | number;

  Terreno_Plano: SimNao;
  Tem_Arvore_na_Area_Locada: SimNao;
  Tem_Construcao_na_Area_Locada: SimNao;
  Medidas_Area_Locada?: string;

  Energia_no_Imovel: SimNao;
  Fase_Monofasico: SimNao;
  Fase_Bifasico: SimNao;
  Fase_Trifasico: SimNao;
  Tensao_110V: SimNao;
  Tensao_220V: SimNao;
  Necessita_Extensao_de_Rede: SimNao;
  Extensao_Rede_Metros?: string;

  Coordenadas_Trafo?: string;
  Numero_Trafo?: string;
  Potencia_Trafo?: string;
  Numero_Medidor?: string;
  Coordenadas_Medidor?: string;

  Resumo_Historico_Imovel?: string;
  Observacoes_Gerais?: string;
};

export type DocumentacaoSecao = {
  IPTU_ou_ITR?: "IPTU" | "ITR" | "";
  Escritura_Particular_Compra_Venda: SimNao;
  Contrato_Compra_Venda: SimNao;
  Tempo_Documento_Compra_Venda?: string;
  Matricula_em_Cartorio: SimNao;
  Escritura_Publica_Compra_Venda: SimNao;
  Inventario: DocumentoSN;
  Conta_Concessionaria_Foto: SimNao;
  Resumo_Documentacao?: string;
};

export type RegrasObsSecao = {
  Rodovia_Estadual_Maior_40m?: SimNao;
  Rio_Maior_50m?: SimNao;
  Colegio_Maior_50m?: SimNao;
  Hospital_Maior_50m?: SimNao;
  AreaLocada_Livre_Limpa?: SimNao;
  Arvores_Informar_Especie?: SimNao;
  Observacoes?: string;
};

export type CroquiSecao = {
  Tamanho_Total_Terreno?: string;
  Local_Tamanho_Area_Locada?: string;
  Vegetacao_Existente_Descricao?: string;
  Construcoes_Descricao?: string;
  Acesso_Largura_Comprimento?: string;
  Niveis_Terreno_vs_Rua?: string;
  Anotacoes_Gerais?: string;
  Coordenadas_Ponto_Nominal?: string;
};

export type RelatorioChecklist = {
  relatorio_id: string;
  timestamp_iso: string;
  versao_template: string;
  inicio: InicioSecao;
  documentacao: DocumentacaoSecao;
  regras_obs?: RegrasObsSecao;
  croqui?: CroquiSecao;
  fotos: FotosItem[];
};



