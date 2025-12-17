

import argparse
import datetime as dt
import difflib
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI, OpenAIError

# -------------------- PROMPTS FIXOS / CONTEXTO DO PROJETO --------------------

SYSTEM_PROMPT = """Você é um editor de código extremamente cuidadoso.
Tarefa: preencher COMPLETAMENTE o dados fornecido de acordo com a instrução do usuário.
Regras obrigatórias de saída:
- Retorne SOMENTE o conteúdo final do arquivo, sem comentários adicionais, explicações ou blocos Markdown.
- Não inclua cercas de código ``` nem prefixos como 'Arquivo:'.
- Preserve encoding (UTF-8) e quebras de linha coerentes.
- Se a instrução pedir testes, inclua-os apenas se este arquivo for o de testes; caso contrário, mantenha o foco no arquivo alvo.
- Se a mudança exigir imports, adicione-os.
- Mantenha estilo PEP8 quando for Python.
- Garanta que os dados fornecidos fiquem arquivados mesmo que não haja conexão com a internet.
"""

PROJECT_ROOT = r"D:\trabalhos em python\aplicativo_relatorio_de_visita_externa"

DOMAIN_PROMPT = """
Título do app: Relatório de Buscas
Empresa: CTM (ctmsites.com.br)
Objetivo: Criar um relatório com informações inseridas por usuários durante visita externa, conforme checklist.

# INFORMAÇÕES DO SITE
- id do site (imput do texto inserido pelo usuário), Sharing (imput do texto inserido pelo usuário), data (imput da data inserida pelo usuário no formato: DD/MM/AAAA), OPERADORA (imput do texto inserido pelo usuário)
- Greenfield 🔲 Rooftop 🔲
- Cidade (imput do texto inserido pelo usuário), Proprietário(textoinserido pelo usuário), Telefone (imput do texto inserido pelo usuário), CANDIDATO (imput do texto inserido pelo usuário), COORDENADAS (imput do texto inserido pelo usuário)
- Endereço do site (imput texto inserido pelo usuário), Bairro (imput do texto inserido pelo usuário), CEP (imput do texto inserido pelo usuário), Representante (imput do texto inserido pelo usuário)

# DOCUMENTAÇÃO
- IPTU ou ITR?
- Contrato/Escritura Particular de Compra e Venda? SIM/NÃO
- Contrato de Compra e Venda? SIM/NÃO
- Tempo de documento de compra e venda
- Matrícula em Cartório? SIM/NÃO
- Escritura Pública de Compra e Venda? SIM/NÃO
- Inventário? SIM/NÃO/N-A
- Conta de Concessionária? (foto) SIM/NÃO
- Resumo do histórico do imóvel, Proposta/Contra-proposta

# INFRAESTRUTURA / ENERGIA
- Terreno plano? SIM/NÃO
- Árvore na área locada? SIM/NÃO (informar espécie)
- Construção na área locada? SIM/NÃO
- Medidas da área locada
- Energia no imóvel? SIM/NÃO — Mono/Bi/Tri — 110V/220V
- Extensão de rede? SIM/NÃO (metros)
- Coordenadas do trafo/medidor/ponto nominal, nº e potência do trafo

# FOTOS CHECKLIST (sempre demarcar área locada com tira zebrada)
- Rua de acesso (direita/esquerda)
- Calçada (direita/esquerda)
- Frente do imóvel (1ª e 2ª)
- Vizinhos (direita/esquerda)
- Poste em frente (com GPS)
- Relógio mais próximo (com GPS e tipo de energia)
- Trafo mais próximo (com GPS)
- Rede na rua do imóvel (2 fotos) e rua principal (2 fotos)
- Site: lados 1–4, diagonais 1–2
- Visão geral da área locada
- Fotos voltadas para dentro do terreno (4 cantos)
- Construções/árvores/detalhes (até 3 fotos)
- Acesso da portaria/entrada até a área locada (até 3 fotos)
- Coordenadas GPS do site
- 12 fotos 360° (meio da área) — ângulos 0°..330° de 30 em 30
- Panorâmica (do mesmo ponto 360°, iniciando ao Norte)
- 12 fotos 360° (frente do imóvel) — ângulos 0°..330°

# OBSERVAÇÕES
- Distâncias mínimas: rodovia estadual > 40m; rio > 50m; colégio > 50m; hospital > 50m
- Área locada deve ser entregue livre/limpa, sem vegetação/entulhos
- Se houver árvores, informar espécie

# CROQUI
- Tamanho total do terreno; local/tamanho da área locada
- Vegetação existente (dentro/fora) + distâncias
- Construções (dentro/fora) com dimensões/localização
- Acesso (largura/comprimento)
- Níveis do terreno e da área locada vs. rua

# ENVIO
- Botão “Enviar” chama API para integrar com planilha externa.
"""

USER_TEMPLATE = """INSTRUÇÃO:
{instruction}

PROJETO (contexto):
- Raiz do projeto: {project_root}
- Objetivo e checklist (fixo, resumido):
{domain_prompt}

CAMINHO DO ARQUIVO:
{filepath}

CONTEÚDO ATUAL DO ARQUIVO (entre <<<FILE_START e FILE_END>>>):
<<<FILE_START
{file_content}
FILE_END>>>

Saída esperada:
SOMENTE o conteúdo final que deve ir para o arquivo {filepath}, sem marcas markdown, sem comentários extras fora do código.
"""

# --------------------------- FUNÇÕES UTILITÁRIAS ------------------------------

def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="utf-8-sig")

def write_text(path: Path, content: str):
    path.write_text(content, encoding="utf-8", newline="")

def make_backup(path: Path) -> Path:
    ts = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = path.with_suffix(path.suffix + f".bak.{ts}")
    write_text(backup, read_text(path))
    return backup

def get_completion(client: OpenAI, model: str, system: str, user: str, max_tokens: int):
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0,
        max_tokens=max_tokens,
    )
    return resp.choices[0].message.content or ""

# --------------------------------- MAIN ---------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Edite arquivos localmente usando modelos da OpenAI (estilo Codex)."
    )
    parser.add_argument("file", type=str, help="Caminho do arquivo a ser reescrito")
    parser.add_argument("instruction", type=str, help="Instrução para a edição")
    parser.add_argument(
        "--model",
        type=str,
        default="gpt-4.1-mini",
        help="Modelo OpenAI (ex.: gpt-4o-mini, gpt-4.1, gpt-5-turbo...)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Não altera o arquivo; apenas mostra a saída (e o diff, se --show-diff).",
    )
    parser.add_argument(
        "--show-diff",
        action="store_true",
        help="Mostra diff unified entre o original e o resultado.",
    )
    parser.add_argument(
        "--backup",
        action="store_true",
        help="Cria um backup do arquivo original antes de sobrescrever.",
    )
    parser.add_argument(
        "--out",
        type=str,
        default=None,
        help="Escreve o resultado em outro caminho em vez de sobrescrever o arquivo original.",
    )
    parser.add_argument(
        "--max-tokens",
        type=int,
        default=4096,
        help="Limite de tokens de saída (aumente se o arquivo for grande).",
    )

    args = parser.parse_args()

    load_dotenv()  # carrega OPENAI_API_KEY do .env
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Erro: defina OPENAI_API_KEY no .env (ou no ambiente).", file=sys.stderr)
        sys.exit(1)

    target_path = Path(args.file).resolve()
    if not target_path.exists() or not target_path.is_file():
        print(f"Erro: arquivo não encontrado: {target_path}", file=sys.stderr)
        sys.exit(2)

    original = read_text(target_path)

    # Monta o prompt do usuário com contexto do domínio e raiz do projeto
    user_prompt = USER_TEMPLATE.format(
        instruction=args.instruction.strip(),
        filepath=str(target_path),
        file_content=original,
        project_root=PROJECT_ROOT,
        domain_prompt=DOMAIN_PROMPT.strip()
    )

    client = OpenAI(api_key=api_key)
    try:
        new_content = get_completion(
            client=client,
            model=args.model,
            system=SYSTEM_PROMPT,
            user=user_prompt,
            max_tokens=args.max_tokens,
        )
    except OpenAIError as e:
        print(f"Falha ao chamar OpenAI: {e}", file=sys.stderr)
        sys.exit(3)

    if new_content.strip() == "":
        print("Aviso: modelo retornou conteúdo vazio. Nada foi alterado.", file=sys.stderr)
        sys.exit(0)

    normalized_original = original.replace("\r\n", "\n")
    normalized_new = new_content.replace("\r\n", "\n")

    if args.show_diff:
        diff = difflib.unified_diff(
            normalized_original.splitlines(keepends=True),
            normalized_new.splitlines(keepends=True),
            fromfile=f"{target_path.name} (original)",
            tofile=f"{target_path.name} (novo)",
            lineterm=""
        )
        print("".join(diff))

    if args.dry-run:
        print("\n" + normalized_new)
        return

    if args.out:
        out_path = Path(args.out).resolve()
        out_path.parent.mkdir(parents=True, exist_ok=True)
        write_text(out_path, normalized_new)
        print(f"[OK] Arquivo gerado em: {out_path}")
    else:
        if args.backup:
            backup_path = make_backup(target_path)
            print(f"[INFO] Backup criado: {backup_path}")
        write_text(target_path, normalized_new)
        print(f"[OK] Arquivo sobrescrito: {target_path}")

if __name__ == "__main__":
    main()
