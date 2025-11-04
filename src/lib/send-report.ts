import type { DocumentoSN, SimNao, FotosItem, InicioSecao, DocumentacaoSecao, RegrasObsSecao, CroquiSecao, RelatorioChecklist } from "@/types/report";
// src/lib/send-report.ts

/** ======== NORMALIZAÇÃO/UTILS ======== */
function toYesNo(v: any): "SIM" | "NAO" {
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["sim", "s", "true", "1", "yes", "y"].includes(s)) return "SIM";
    if (["nao", "não", "n", "false", "0", "no"].includes(s)) return "NAO";
  }
  return v ? "SIM" : "NAO";
}

function onlyDigits(s?: string) { return (s || "").replace(/\D+/g, ""); }
function normPhone(s?: string) {
  const d = onlyDigits(s); if (!d) return "";
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
  return Number.isFinite(n) ? n.toFixed(2) : "";
}

/**
 * ======== LISTA OFICIAL DOS ITENS DE FOTO (em ordem, como no prompt) ========
 * Você pode usar para renderizar o formulário e validar que todos foram preenchidos.
 */
export const FOTO_ITENS_PADRAO: string[] = [
  "RUA DE ACESSO AO IM\u00D3VEL (direita)",
  "RUA DE ACESSO AO IM\u00D3VEL (esquerda)",
  "CAL\u00C7ADA (direita)",
  "CAL\u00C7ADA (esquerda)",
  "FRENTE DO IM\u00D3VEL (1)",
  "FRENTE DO IM\u00D3VEL (2)",
  "VIZINHO DO IM\u00D3VEL (direita)",
  "VIZINHO DO IM\u00D3VEL (esquerda)",
  "POSTE EM FRENTE AO IM\u00D3VEL / Coordenadas GPS",
  "REL\u00D3GIO MAIS PR\u00D3XIMO / Coordenadas GPS (VERIFICAR TIPO DE ENERGIA)",
  "TRAFO MAIS PR\u00D3XIMO / Coordenadas GPS",
  "FOTO 1 DA REDE NA RUA DO IM\u00D3VEL",
  "FOTO 2 DA REDE NA RUA DO IM\u00D3VEL",
  "FOTO 1 DA REDE NA RUA PRINCIPAL",
  "FOTO 2 DA REDE NA RUA PRINCIPAL",
  "Foto do site (lado 1 - Frente para tr\u00E1s)",
  "Foto do site (lado 2 - Direita para esquerda)",
  "Foto do site (lado 3 - Tr\u00E1s para frente)",
  "Foto do site (lado 4 - Esquerda para direita)",
  "Foto do site (diagonal 1)",
  "Foto do site (diagonal 2)",
  "VIS\u00C3O GERAL DA \u00C1REA LOCADA",
  "FOTOS VOLTADAS PARA DENTRO DO TERRENO DOS 4 CANTOS DO IM\u00D3VEL (quando poss\u00EDvel)",
  "FOTOS DE TODAS AS CONSTRU\u00C7\u00D5ES, \u00C1RVORES E DETALHES NO IM\u00D3VEL",
  "FOTOS DE TODO ACESSO DA PORTARIA OU ENTRADA AT\u00C9 A \u00C1REA LOCADA (existente ou a construir e em caso de condom\u00EDnio)",
  "Coordenadas GPS do SITE",
  "12 FOTOS 360\u00B0 (do meio da \u00E1rea locada, iniciando no Norte)",
  "PANOR\u00C2MICA (do mesmo local das de 360\u00B0, iniciando ao Norte)",
  "12 FOTOS 360\u00B0 (da frente do im\u00F3vel, iniciando no Norte)"
];

/**
 * ======== BUILDER DO PAYLOAD PARA O MAKE ========
 * Recebe objetos "soltos" (ex.: vindo de um formulário) e normaliza tudo.
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

  // --- INÍCIO (normalizações de SIM/NAO, moeda, CEP/telefone) ---
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

    Site_ID: input.inicio.Site_ID || "",
    Data_Visita: input.inicio.Data_Visita || "",
    Endereco_Site: input.inicio.Endereco_Site || "",
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

  // --- DOCUMENTAÇÃO ---
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
        Anotacoes_Gerais: input.croqui.Anotacoes_Gerais || "",
        Coordenadas_Ponto_Nominal: input.croqui.Coordenadas_Ponto_Nominal || "",
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
 * Envia o JSON completo do relatório.
 */
export async function enviarViaMake(relatorio: RelatorioChecklist) {
  // Tenta pegar a variável do ambiente (.env.local ou Heroku)
  const webhookUrl =
    process.env.MAKE_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_MAKE_WEBHOOK; // compatível com o nome antigo

  if (!webhookUrl) {
    throw new Error(
      "Webhook do Make não configurado. Adicione MAKE_WEBHOOK_URL no .env.local"
    );
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // cabeçalho opcional para segurança extra
      "X-CTM-Key": process.env.CTM_API_KEY || "",
    },
    body: JSON.stringify(relatorio),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Make falhou: ${res.status} - ${text}`);
  }

  return res.text();
}




