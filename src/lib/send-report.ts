// src/lib/send-report.ts

/**
 * ======== NORMALIZAÃ‡ÃƒO/UTILS ========
 */
function toYesNo(v: any): "SIM" | "NAO" {
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["sim", "s", "true", "1", "yes", "y"].includes(s)) return "SIM";
    if (["nao", "nÃ£o", "n", "false", "0", "no"].includes(s)) return "NAO";
  }
  return v ? "SIM" : "NAO";
}
function onlyDigits(s?: string) {
  return (s || "").replace(/\D+/g, "");
}
function normPhone(s?: string) {
  const d = onlyDigits(s);
  if (!d) return "";
  // BR: +55DD9XXXXXXXX
  return d.length === 11 ? `+55${d}` : d;
}
function normCEP(s?: string) {
  const d = onlyDigits(s);
  return d.length === 8 ? `${d.slice(0,5)}-${d.slice(5)}` : d;
}
function normCurrency(s?: string | number) {
  if (typeof s === "number") return s.toFixed(2);
  if (!s) return "";
  const n = Number(String(s).replace(/[^\d,.-]/g, "").replace(".", "").replace(",", "."));
  return isFinite(n) ? n.toFixed(2) : "";
}

/**
 * ======== TIPOS (ESPELHO DO CHECKLIST) ========
 */
export type DocumentoSN = "SIM" | "NAO" | "NA"; // InventÃ¡rio aceita N/A
export type SimNao = "SIM" | "NAO";

export type FotosItem = {
  foto_item: string;          // rÃ³tulo exato da lista
  arquivo_url: string;        // URL pÃºblica
  gps_lat?: string;
  gps_lng?: string;
  observacao?: string;
  zebrado_aplicado?: SimNao;  // demarcar Ã¡rea locada
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


  Site_ID?: string;\r\n  Data_Visita?: string;\r\n  Endereco_Site?: string;         // â€œENDEREÃ‡O DO SITEâ€ (texto Ãºnico)
  Endereco_Logradouro?: string;
  Endereco_Numero?: string;
  Endereco_Complemento?: string;
  Endereco_Bairro?: string;
  Endereco_Cidade?: string;
  Endereco_UF?: string;
  Endereco_CEP?: string;

  Representante?: string;

  // Proposta / Infra
  Proposta_R$?: string | number;
  ContraProposta_R$?: string | number;

  Terreno_Plano: SimNao;
  Tem_Arvore_na_Area_Locada: SimNao;
  Tem_Construcao_na_Area_Locada: SimNao;
  Medidas_Area_Locada?: string;

  // Energia
  Energia_no_Imovel: SimNao;
  Fase_Monofasico: SimNao;
  Fase_Bifasico: SimNao;
  Fase_Trifasico: SimNao;
  Tensao_110V: SimNao;
  Tensao_220V: SimNao;
  Necessita_Extensao_de_Rede: SimNao;
  Extensao_Rede_Metros?: string;

  // Trafo/Medidor
  Coordenadas_Trafo?: string;
  Numero_Trafo?: string;
  Potencia_Trafo?: string;
  Numero_Medidor?: string;
  Coordenadas_Medidor?: string;

  // HistÃ³rico geral
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
  Inventario: DocumentoSN; // SIM/NAO/NA
  Conta_Concessionaria_Foto: SimNao; // existe foto?
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
  // metadados
  relatorio_id: string;
  timestamp_iso: string;
  versao_template: string;

  // seÃ§Ãµes
  inicio: InicioSecao;
  documentacao: DocumentacaoSecao;
  regras_obs?: RegrasObsSecao;
  croqui?: CroquiSecao;

  // fotos (lista)
  fotos: FotosItem[];
};

/**
 * ======== LISTA OFICIAL DOS ITENS DE FOTO (em ordem, como no prompt) ========
 * VocÃª pode usar para renderizar o formulÃ¡rio e validar que todos foram preenchidos.
 */
export const FOTO_ITENS_PADRAO: string[] = [
  "RUA DE ACESSO AO IMÃ“VEL (direita)",
  "RUA DE ACESSO AO IMÃ“VEL (esquerda)",
  "CALÃ‡ADA (direita)",
  "CALÃ‡ADA (esquerda)",
  "FRENTE DO IMÃ“VEL (1)",
  "FRENTE DO IMÃ“VEL (2)",
  "VIZINHO DO IMÃ“VEL (direita)",
  "VIZINHO DO IMÃ“VEL (esquerda)",
  "POSTE EM FRENTE AO IMÃ“VEL / Coordenadas GPS",
  "RELÃ“GIO MAIS PRÃ“XIMO / Coordenadas GPS (VERIFICAR TIPO DE ENERGIA)",
  "TRAFO MAIS PRÃ“XIMO / Coordenadas GPS",
  "FOTO 1 DA REDE NA RUA DO IMÃ“VEL",
  "FOTO 2 DA REDE NA RUA DO IMÃ“VEL",
  "FOTO 1 DA REDE NA RUA PRINCIPAL",
  "FOTO 2 DA REDE NA RUA PRINCIPAL",
  "Foto do site (lado 1 â€“ Frente para trÃ¡s)",
  "Foto do site (lado 2 â€“ Direita para esquerda)",
  "Foto do site (lado 3 â€“ TrÃ¡s para frente)",
  "Foto do site (lado 4 â€“ Esquerda para direita)",
  "Foto do site (diagonal 1)",
  "Foto do site (diagonal 2)",
  "VISÃƒO GERAL DA ÃREA LOCADA",
  "FOTOS VOLTADAS PARA DENTRO DO TERRENO DOS 4 CANTOS DO IMÃ“VEL (quando possÃ­vel)",
  "FOTOS DE TODAS AS CONSTRUÃ‡Ã•ES, ÃRVORES E DETALHES NO IMÃ“VEL",
  "FOTOS DE TODO ACESSO DA PORTARIA OU ENTRADA ATÃ‰ A ÃREA LOCADA (existente ou a construir e em caso de condomÃ­nio)",
  "Coordenadas GPS do SITE",
  "12 FOTOS 360Âº (do meio da Ã¡rea locada, iniciando no Norte)",
  "PANORÃ‚MICA (do mesmo local das de 360Âº, iniciando ao Norte)",
  "12 FOTOS 360Âº (da frente do imÃ³vel, iniciando no Norte)"
];

/**
 * ======== BUILDER DO PAYLOAD PARA O MAKE ========
 * Recebe objetos "soltos" (ex.: vindo de um formulÃ¡rio) e normaliza tudo.
 */
export function buildRelatorioPayload(input: {
  relatorio_id?: string;
  versao_template?: string;
  inicio: Partial<InicioSecao>;
  documentacao: Partial<DocumentacaoSecao>;
  regras_obs?: Partial<RegrasObsSecao>;
  croqui?: Partial<CroquiSecao>;
  fotos: Array<Partial<FotosItem>>;
}): RelatorioChecklist {
  const nowIso = new Date().toISOString();
  const relatorio_id = input.relatorio_id || `CTM-${Date.now()}`;
  const versao = input.versao_template || "v2.0";

  // --- INÃCIO (normalizaÃ§Ãµes de SIM/NAO, moeda, CEP/telefone) ---
  const inicio: InicioSecao = {
    Greenfield: toYesNo(input.inicio.Greenfield),
    Rooftop: toYesNo(input.inicio.Rooftop),
    Operadora: input.inicio.Operadora || "",
    Sharing: toYesNo(input.inicio.Sharing),
    Cidade: input.inicio.Cidade || "",

    Proprietario: input.inicio.Proprietario || "",
    Proprietario_Telefone: normPhone(input.inicio.Proprietario_Telefone),
    CAND: input.inicio.CAND || "",
    CORD: input.inicio.CORD || "",

    Site_ID: input.inicio.Site_ID || "",\r\n    Data_Visita: input.inicio.Data_Visita || "",\r\n    Endereco_Site: input.inicio.Endereco_Site || "",
    Endereco_Logradouro: input.inicio.Endereco_Logradouro || "",
    Endereco_Numero: input.inicio.Endereco_Numero || "",
    Endereco_Complemento: input.inicio.Endereco_Complemento || "",
    Endereco_Bairro: input.inicio.Endereco_Bairro || "",
    Endereco_Cidade: input.inicio.Endereco_Cidade || "",
    Endereco_UF: input.inicio.Endereco_UF || "",
    Endereco_CEP: normCEP(input.inicio.Endereco_CEP),

    Representante: input.inicio.Representante || "",

    Proposta_R$: normCurrency(input.inicio.Proposta_R$),
    ContraProposta_R$: normCurrency(input.inicio.ContraProposta_R$),

    Terreno_Plano: toYesNo(input.inicio.Terreno_Plano),
    Tem_Arvore_na_Area_Locada: toYesNo(input.inicio.Tem_Arvore_na_Area_Locada),
    Tem_Construcao_na_Area_Locada: toYesNo(input.inicio.Tem_Construcao_na_Area_Locada),
    Medidas_Area_Locada: input.inicio.Medidas_Area_Locada || "",

    Energia_no_Imovel: toYesNo(input.inicio.Energia_no_Imovel),
    Fase_Monofasico: toYesNo(input.inicio.Fase_Monofasico),
    Fase_Bifasico: toYesNo(input.inicio.Fase_Bifasico),
    Fase_Trifasico: toYesNo(input.inicio.Fase_Trifasico),
    Tensao_110V: toYesNo(input.inicio.Tensao_110V),
    Tensao_220V: toYesNo(input.inicio.Tensao_220V),
    Necessita_Extensao_de_Rede: toYesNo(input.inicio.Necessita_Extensao_de_Rede),
    Extensao_Rede_Metros: input.inicio.Extensao_Rede_Metros || "",

    Coordenadas_Trafo: input.inicio.Coordenadas_Trafo || "",
    Numero_Trafo: input.inicio.Numero_Trafo || "",
    Potencia_Trafo: input.inicio.Potencia_Trafo || "",
    Numero_Medidor: input.inicio.Numero_Medidor || "",
    Coordenadas_Medidor: input.inicio.Coordenadas_Medidor || "",

    Resumo_Historico_Imovel: input.inicio.Resumo_Historico_Imovel || "",
    Observacoes_Gerais: input.inicio.Observacoes_Gerais || "",
  };

  // --- DOCUMENTAÃ‡ÃƒO ---
  const documentacao: DocumentacaoSecao = {
    IPTU_ou_ITR: (input.documentacao.IPTU_ou_ITR || "").toUpperCase() as any,
    Escritura_Particular_Compra_Venda: toYesNo(input.documentacao.Escritura_Particular_Compra_Venda),
    Contrato_Compra_Venda: toYesNo(input.documentacao.Contrato_Compra_Venda),
    Tempo_Documento_Compra_Venda: input.documentacao.Tempo_Documento_Compra_Venda || "",
    Matricula_em_Cartorio: toYesNo(input.documentacao.Matricula_em_Cartorio),
    Escritura_Publica_Compra_Venda: toYesNo(input.documentacao.Escritura_Publica_Compra_Venda),
    Inventario: ((input.documentacao.Inventario || "NA") as DocumentoSN),
    Conta_Concessionaria_Foto: toYesNo(input.documentacao.Conta_Concessionaria_Foto),
    Resumo_Documentacao: input.documentacao.Resumo_Documentacao || "",
  };

  // --- REGRAS/OBS (opcional) ---
  const regras_obs: RegrasObsSecao | undefined = input.regras_obs
    ? {
        Rodovia_Estadual_Maior_40m: toYesNo(input.regras_obs.Rodovia_Estadual_Maior_40m),
        Rio_Maior_50m: toYesNo(input.regras_obs.Rio_Maior_50m),
        Colegio_Maior_50m: toYesNo(input.regras_obs.Colegio_Maior_50m),
        Hospital_Maior_50m: toYesNo(input.regras_obs.Hospital_Maior_50m),
        AreaLocada_Livre_Limpa: toYesNo(input.regras_obs.AreaLocada_Livre_Limpa),
        Arvores_Informar_Especie: toYesNo(input.regras_obs.Arvores_Informar_Especie),
        Observacoes: input.regras_obs.Observacoes || "",
      }
    : undefined;

  // --- CROQUI (opcional) ---
  const croqui: CroquiSecao | undefined = input.croqui
    ? {
        Tamanho_Total_Terreno: input.croqui.Tamanho_Total_Terreno || "",
        Local_Tamanho_Area_Locada: input.croqui.Local_Tamanho_Area_Locada || "",
        Vegetacao_Existente_Descricao: input.croqui.Vegetacao_Existente_Descricao || "",
        Construcoes_Descricao: input.croqui.Construcoes_Descricao || "",
        Acesso_Largura_Comprimento: input.croqui.Acesso_Largura_Comprimento || "",
        Niveis_Terreno_vs_Rua: input.croqui.Niveis_Terreno_vs_Rua || "",
        Anotacoes_Gerais: input.croqui.Anotacoes_Gerais || "",\r\n        Coordenadas_Ponto_Nominal: input.croqui.Coordenadas_Ponto_Nominal || "",
      }
    : undefined;

  // --- FOTOS (lista) ---
  const fotos: FotosItem[] = (input.fotos || []).map((f) => ({
    foto_item: (f.foto_item || "").trim(),
    arquivo_url: (f.arquivo_url || "").trim(),
    gps_lat: f.gps_lat || "",
    gps_lng: f.gps_lng || "",
    observacao: f.observacao || "",
    zebrado_aplicado: f.zebrado_aplicado ? toYesNo(f.zebrado_aplicado) : "NAO",
  }));

  return {
    relatorio_id,
    timestamp_iso: nowIso,
    versao_template: versao,
    inicio,
    documentacao,
    regras_obs,
    croqui,
    fotos,
  };
}

/**
 * ======== ENVIO VIA MAKE (WEBHOOK) ========
 * Envia o JSON completo do relatÃ³rio.
 */
/**
 * ======== ENVIO VIA MAKE (WEBHOOK) ========
 * Envia o JSON completo do relatÃ³rio.
 */
export async function enviarViaMake(relatorio: RelatorioChecklist) {
  // Tenta pegar a variÃ¡vel do ambiente (.env.local ou Heroku)
  const webhookUrl =
    process.env.MAKE_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_MAKE_WEBHOOK; // compatÃ­vel com o nome antigo

  if (!webhookUrl) {
    throw new Error(
      "âŒ Webhook do Make nÃ£o configurado. Adicione MAKE_WEBHOOK_URL no .env.local"
    );
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // cabeÃ§alho opcional para seguranÃ§a extra
      "X-CTM-Key": process.env.CTM_API_KEY || "",
    },
    body: JSON.stringify(relatorio),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`âŒ Make falhou: ${res.status} - ${text}`);
  }

  return res.text();
}