// src/types/report.ts

/**
 * Foto vinculada ao relatÃ³rio. Pode ter categoria (ex.: "poste", "relogio", "trafo", "site", etc.)
 * e coordenadas GPS especÃ­ficas daquela foto.
 */
export type PhotoEntry = {
  descricao: string;      // legenda curta exibida na UI
  url: string;            // URL (ou caminho local) da imagem
  gps?: string;           // ex.: "-23.5505, -46.6333" (opcional)
  categoria?: string;     // ex.: "poste", "relogio", "trafo", "acesso", etc. (opcional)
};

/**
 * Dados principais do relatÃ³rio â€“ mapeados 1:1 com o checklist.
 * Campos de duas opÃ§Ãµes geralmente sÃ£o radios ("sim" | "nao").
 * Campos com mÃºltiplas opÃ§Ãµes sÃ£o arrays (ex.: energiaTipo, energiaVoltagem).
 */
export type ReportData = {
  // ========================
  // INFORMAÃ‡Ã•ES INICIAIS
  // ========================
  siteType?: "greenfield" | "rooftop"; // Greenfield / Rooftop
  operadora?: string;                  // Operadora
  sharing?: string;                    // Sharing
  cidade?: string;                     // CIDADE
  proprietario?: string;               // PROPRIETÃRIO
  telefone?: string;                   // TEL (geral)
  cand?: string;                       // CAND
  cord?: string;                       // CORD
  endereco?: string;                   // ENDEREÃ‡O
  enderecoSite?: string;               // ENDEREÃ‡O DO SITE
  bairro?: string;                     // BAIRRO
  representante?: string;              // REPRESENTANTE

  
  siteId?: string;                   // ID do site
  dataVisita?: string;               // Data da visita (DD/MM/AAAA)
  cep?: string;                      // CEP
// ========================
  // DOCUMENTAÃ‡ÃƒO
  // ========================
  iptuItr?: string;                    // "IPTU" ou "ITR"
  escrituraParticular?: boolean;       // Escritura Particular de Compra e Venda? (SIM/NÃƒO)
  contratoCompraVenda?: boolean;       // Contrato de Compra e Venda? (SIM/NÃƒO)
  tempoDocumento?: string;             // Tempo de documento de compra e venda
  matriculaCartorio?: boolean;         // MatrÃ­cula em CartÃ³rio? (SIM/NÃƒO)
  escrituraPublica?: boolean;          // Escritura PÃºblica de Compra e Venda? (SIM/NÃƒO)
  inventario?: boolean;                // InventÃ¡rio? (SIM/NÃƒO) | N/A pode ser tratado como false ou string externa
  contaConcessionaria?: boolean;       // Conta de ConcessionÃ¡ria? (foto virÃ¡ em fotos)
  resumoHistorico?: string;            // Resumo do histÃ³rico do imÃ³vel
  telefoneDoc?: string;                // TEL (campo na seÃ§Ã£o documentaÃ§Ã£o)
  proposta?: string;                   // PROPOSTA (R$)
  contraProposta?: string;             // CONTRA PROPOSTA (R$)

  // ========================
  // INFRA (terreno / energia)
  // ========================
  terrenoPlano?: "sim" | "nao";        // Terreno plano?
  arvoreArea?: "sim" | "nao";          // Tem Ã¡rvore na Ã¡rea locada?
  construcaoArea?: "sim" | "nao";      // Tem construÃ§Ã£o na Ã¡rea locada?
  medidasArea?: string;                // Medidas da Ã¡rea locada

  energia?: "sim" | "nao";             // ENERGIA NO IMÃ“VEL?
  energiaTipo?: ("mono" | "bi" | "tri")[];   // Mono / Bi / Tri (mÃºltipla escolha)
  energiaVoltagem?: ("110" | "220")[];       // 110V / 220V (mÃºltipla escolha)
  extensaoRede?: "sim" | "nao";        // Necessita de extensÃ£o de rede?
  metrosExtensao?: string;             // Quantos metros?

  coordenadasPontoNominal?: string;   // Coordenadas do ponto nominal

  // ========================
  // DADOS ELÃ‰TRICOS / COORDENADAS
  // ========================
  coordenadasTrafo?: string;           // Coordenadas do Trafo
  numeroTrafo?: string;                // NÃºmero do trafo
  potenciaTrafo?: string;              // PotÃªncia do trafo
  numeroMedidor?: string;              // NÃºmero do medidor
  coordenadasMedidor?: string;         // Coordenadas do medidor

  // ========================
  // CROQUI / OBSERVAÃ‡Ã•ES
  // ========================
  tamanhoTerreno?: string;             // Tamanho total do terreno / local e tamanho da Ã¡rea locada
  vegetacaoExistente?: string;         // VegetaÃ§Ã£o existente (espÃ©cie / localizaÃ§Ã£o)
  construcoesTerreno?: string;         // ConstruÃ§Ãµes no terreno (dimensÃµes / localizaÃ§Ã£o)
  acesso?: string;                     // Acesso (largura, comprimento)
  niveisTerreno?: string;              // NÃ­veis do terreno e da Ã¡rea locada em relaÃ§Ã£o Ã  rua
  observacoesGerais?: string;          // ObservaÃ§Ãµes gerais (ex.: distÃ¢ncias mÃ­nimas: rodovia, rio, colÃ©gio, hospital)

  // ========================
  // FOTOS (mantidas em outro componente/fluxo)
  // ========================
  fotos?: PhotoEntry[];                // Lista de fotos anexadas (cada uma com descriÃ§Ã£o/categoria/gps)
};

/**
 * Estrutura final enviada/salva.
 * VocÃª pode acrescentar metadados como usuÃ¡rio, versÃ£o, etc.
 */
export type RelatorioChecklist = ReportData & {
  timestamp_iso?: string;              // Ex.: new Date().toISOString()
  // userId?: string;
  // versao?: string;
};
// ========================
// OBJETO BASE (formulÃ¡rio vazio)
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
// FUNÃ‡ÃƒO DE VALIDAÃ‡ÃƒO
// ========================
export function validateReport(data: ReportData): string[] {
  const errors: string[] = [];

  // campos essenciais para submissÃ£o
  if (!data.siteType) errors.push("Tipo de site (Greenfield/Rooftop)");
  if (!data.operadora) errors.push("Operadora");
  if (!data.cidade) errors.push("Cidade");
  if (!data.proprietario) errors.push("ProprietÃ¡rio");
  if (!data.telefone) errors.push("Telefone");
  if (!data.enderecoSite) errors.push("Endereço do site");
  if (!data.representante) errors.push("Representante");

  // infraestrutura bÃ¡sica
  if (!data.terrenoPlano) errors.push("Terreno plano (Sim/NÃ£o)");
  if (!data.energia) errors.push("Energia no imÃ³vel (Sim/NÃ£o)");
  if (data.energia === "sim" && data.energiaTipo?.length === 0)
    errors.push("Tipo de energia (Mono/Bi/Tri)");
  if (data.extensaoRede === "sim" && !data.metrosExtensao)
    errors.push("Metros de extensÃ£o de rede");

  // pelo menos 1 foto
  if (!data.fotos || data.fotos.length === 0)
    errors.push("Ã‰ necessÃ¡rio anexar ao menos uma foto");

  return errors;
}
