import argparse
import json
import sys
from pathlib import Path
from datetime import datetime
import requests

# ATENÇÃO: o link abaixo DEVE ser um endpoint válido que aceite POST
# (por exemplo, um Web App do Google Apps Script que escreve na planilha).
# A URL de visualização do Google Sheets (docs.google.com/spreadsheets/...) NÃO aceita POST diretamente.
link = "https://script.google.com/macros/s/SEU_DEPLOY_ID/exec"  # substitua pelo seu endpoint Apps Script


def carregar_relatorio(arquivo: Path) -> dict:
    """
    Carrega um arquivo JSON exportado pelo app (Exportar JSON)
    contendo TODOS os dados preenchidos, incluindo photosUploads.
    """
    try:
        data = json.loads(arquivo.read_text(encoding="utf-8"))
        # Garante timestamp
        if not isinstance(data, dict):
            raise ValueError("JSON de relatório inválido (esperado objeto)")
        data.setdefault("timestamp_iso", datetime.utcnow().isoformat())
        return data
    except Exception as e:
        raise SystemExit(f"Falha ao ler JSON '{arquivo}': {e}")


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Envia um relatório completo (JSON exportado pelo app) via POST para um endpoint externo"
    )
    parser.add_argument(
        "--file",
        "-f",
        required=True,
        help="Caminho para o arquivo JSON exportado pelo app (Exportar)",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=30,
        help="Timeout da requisição em segundos (padrão: 30)",
    )
    args = parser.parse_args(argv)

    arquivo = Path(args.file)
    if not arquivo.exists():
        raise SystemExit(f"Arquivo não encontrado: {arquivo}")

    payload = carregar_relatorio(arquivo)

    # Envia exatamente o mesmo payload utilizado no app/backend
    # Observação: payload pode conter imagens como data URLs (base64), o que deixa o corpo grande.
    try:
        resp = requests.post(link, json=payload, timeout=args.timeout)
        print("status:", resp.status_code)
        print("resposta:", resp.text[:2000])
        resp.raise_for_status()
    except requests.RequestException as e:
        raise SystemExit(f"Falha na requisição: {e}")


if __name__ == "__main__":
    main()
