import { NextResponse } from "next/server";
import { buildRelatorioPayload } from "@/lib/send-report";

export async function POST(req: Request) {
  try {
    const url =
      process.env.MAKE_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL ||
      process.env.NEXT_PUBLIC_MAKE_WEBHOOK ||
      "https://hook.us2.make.com/md2qumk6vtdqljbdszp2sc45khxa555e";

    const body = await req.json();

    const inicio = {
      Greenfield: body?.siteType === "greenfield",
      Rooftop: body?.siteType === "rooftop",
      Operadora: body?.operadora || "",
      Sharing: body?.sharing === "sim" || body?.sharing === true,
      Cidade: body?.cidade || "",
      Proprietario: body?.proprietario || "",
      Proprietario_Telefone: body?.telefone || "",
      CAND: body?.cand || "",
      CORD: body?.cord || "",
      Site_ID: body?.siteId || "",
      Data_Visita: body?.dataVisita || "",
      Endereco_Site: body?.enderecoSite || "",
      Endereco_Logradouro: body?.endereco || "",
      Endereco_Bairro: body?.bairro || "",
      Endereco_Cidade: body?.cidade || "",
      Endereco_CEP: body?.cep || "",
      Representante: body?.representante || "",
      Proposta_R$: body?.proposta ?? "",
      ContraProposta_R$: body?.contraProposta ?? "",
      Terreno_Plano: body?.terrenoPlano,
      Tem_Arvore_na_Area_Locada: body?.arvoreArea,
      Tem_Construcao_na_Area_Locada: body?.construcaoArea,
      Medidas_Area_Locada: body?.medidasArea || "",
      Energia_no_Imovel: body?.energia,
      Fase_Monofasico: Array.isArray(body?.energiaTipo) ? body.energiaTipo.includes("mono") : false,
      Fase_Bifasico: Array.isArray(body?.energiaTipo) ? body.energiaTipo.includes("bi") : false,
      Fase_Trifasico: Array.isArray(body?.energiaTipo) ? body.energiaTipo.includes("tri") : false,
      Tensao_110V: Array.isArray(body?.energiaVoltagem) ? body.energiaVoltagem.includes("110") : false,
      Tensao_220V: Array.isArray(body?.energiaVoltagem) ? body.energiaVoltagem.includes("220") : false,
      Necessita_Extensao_de_Rede: body?.extensaoRede,
      Extensao_Rede_Metros: body?.metrosExtensao || "",
      Coordenadas_Trafo: body?.coordenadasTrafo || "",
      Numero_Trafo: body?.numeroTrafo || "",
      Potencia_Trafo: body?.potenciaTrafo || "",
      Numero_Medidor: body?.numeroMedidor || "",
      Coordenadas_Medidor: body?.coordenadasMedidor || "",
    };

    const documentacao = {
      IPTU_ou_ITR: body?.iptuItr || "",
      Escritura_Particular_Compra_Venda: body?.escrituraParticular,
      Contrato_Compra_Venda: body?.contratoCompraVenda,
      Tempo_Documento_Compra_Venda: body?.tempoDocumento || "",
      Matricula_em_Cartorio: body?.matriculaCartorio,
      Escritura_Publica_Compra_Venda: body?.escrituraPublica,
      Inventario: body?.inventario ? "SIM" : "NAO",
      Conta_Concessionaria_Foto: body?.contaConcessionaria,
      Resumo_Documentacao: body?.resumoHistorico || "",
    };

    const croqui = {
      Tamanho_Total_Terreno: body?.tamanhoTerreno || "",
      Local_Tamanho_Area_Locada: body?.medidasArea || "",
      Vegetacao_Existente_Descricao: body?.vegetacaoExistente || "",
      Construcoes_Descricao: body?.construcoesTerreno || "",
      Acesso_Largura_Comprimento: body?.acesso || "",
      Niveis_Terreno_vs_Rua: body?.niveisTerreno || "",
      Anotacoes_Gerais: body?.observacoesGerais || "",
      Coordenadas_Ponto_Nominal: body?.coordenadasPontoNominal || "",
    };

    const regras_obs = {
      Rodovia_Estadual_Maior_40m: !!body?.regraRodovia40,
      Rio_Maior_50m: !!body?.regraRio50,
      Colegio_Maior_50m: !!body?.regraColegio50,
      Hospital_Maior_50m: !!body?.regraHospital50,
      AreaLocada_Livre_Limpa: !!body?.regraAreaLivre,
      Arvores_Informar_Especie: !!body?.regraArvoresEspecie,
      Observacoes: body?.regrasObs || "",
    };

    const fotos: Array<any> = [];
    if (body?.photosUploads && typeof body.photosUploads === "object") {
      for (const key of Object.keys(body.photosUploads)) {
        const entry = body.photosUploads[key] || {};
        const imgs: string[] = entry.images || [];
        const lat = entry?.coords?.lat;
        const lng = entry?.coords?.lng;
        if (imgs.length === 0) {
          fotos.push({ foto_item: key, arquivo_url: "", gps_lat: lat ? String(lat) : undefined, gps_lng: lng ? String(lng) : undefined , observacao: (entry?.coordsText as any) || "" });
        } else {
          let idx = 1;
          for (const dataUrl of imgs) {
            fotos.push({
              foto_item: imgs.length > 1 ? `${key} (${idx++})` : key,
              arquivo_url: dataUrl,
              gps_lat: lat ? String(lat) : undefined,
              gps_lng: lng ? String(lng) : undefined,
            });
          }
        }
      }
    }

    const payload = buildRelatorioPayload({
      relatorio_id: body?.cand || undefined,
      versao_template: "v2.0",
      inicio: inicio as any,
      documentacao: documentacao as any,
      regras_obs: regras_obs as any,
      croqui: croqui as any,
      fotos,
    });

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CTM-Key": process.env.CTM_API_KEY || "",
      },
      body: JSON.stringify(payload),
    });

    const text = await r.text();
    if (!r.ok) return new NextResponse(text, { status: r.status });
    return new NextResponse(text, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "Falha ao enviar ao Make" }, { status: 500 });
  }
}
