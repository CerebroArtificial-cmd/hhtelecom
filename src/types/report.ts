export type PhotoEntry = {
  files?: File[]; // usado no client (não enviar pro backend)
  urls?: string[]; // dataURL ou URL gerada no envio
  coordsText?: string; // "-23.550520, -46.633310"
  coords?: { lat: number; lng: number };
};

export type PhotosUploads = Record<string, PhotoEntry>;

export interface ReportData {
  [key: string]: any;
  siteId?: string;
  dataVisita?: string;
  hunter?: string;
  operadora?: string;
  sharing?: string;
  searchingRing?: "SIM" | "NÃO" | "N?O";
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

  // Documentação
  iptu?: boolean;
  itr?: boolean;
  iptuItr?: string;
  escrituraParticular?: boolean;
  contratoCompraVenda?: boolean;
  matriculaCartorio?: boolean;
  escrituraPublica?: boolean;
  inventario?: boolean;
  contaConcessionaria?: boolean;
  tempoDocumento?: string;
  telefoneDoc?: string;
  proposta?: string;
  contraProposta?: string;
  resumoHistorico?: string;
  docFoto1?: string;
  docFoto2?: string;
  docFoto3?: string;
  docFoto4?: string;

  photosUploads?: PhotosUploads;
}

export const emptyReportData: ReportData = {
  siteId: "",
  dataVisita: "",
  hunter: "",
  operadora: "",
  sharing: "",
  searchingRing: undefined,
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
  iptu: false,
  itr: false,
  iptuItr: "",
  docFoto1: "",
  docFoto2: "",
  docFoto3: "",
  docFoto4: "",
};

export function validateReport(data: ReportData): string[] {
  const errors: string[] = [];
  if (!data.siteType) errors.push("Tipo de site");
  if (!data.cidade) errors.push("Cidade");
  if (!data.proprietario) errors.push("Proprietário");
  return errors;
}
