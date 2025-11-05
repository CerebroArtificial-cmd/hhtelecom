from __future__ import annotations
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from pathlib import Path
from datetime import datetime
import traceback

# Caminho da planilha existente no repositório
ROOT = Path(__file__).resolve().parent.parent
EXCEL_PATH = ROOT / "Planilha_Visita_Site.xlsx"
SHEET_NAME = "Relatorios"

app = Flask(__name__)
CORS(app)


def _flatten(prefix: str, obj, out: dict):
    """Achatamento simples de dicionários/listas em colunas chaves."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            _flatten(f"{prefix}{k}.", v, out)
    elif isinstance(obj, list):
        out[prefix.rstrip('.') ] = ", ".join([str(x) for x in obj])
    else:
        out[prefix.rstrip('.') ] = obj


def normalize_payload(payload: dict) -> dict:
    """Normaliza o JSON recebido numa linha (dict) pronto para DataFrame."""
    if not isinstance(payload, dict):
        return {"raw": str(payload)}
    base = {"timestamp_iso": payload.get("timestamp_iso") or datetime.utcnow().isoformat()}

    # Flattens top-level known sections if present
    for key in [
        "inicio",
        "documentacao",
        "regras_obs",
        "croqui",
    ]:
        if key in payload:
            _flatten(f"{key}.", payload[key], base)

    # Fotos: resumimos quantidade e itens
    photos = payload.get("photosUploads") or payload.get("fotos") or {}
    if isinstance(photos, dict):
        photo_counts = {f"fotos.{k}.qtd": len((v or {}).get("images") or (v or {}).get("urls") or (v or {}).get("files") or []) for k, v in photos.items()}
        base.update(photo_counts)
    else:
        base["fotos"] = str(photos)

    # Campos soltos no root
    for k, v in payload.items():
        if k in ("inicio","documentacao","regras_obs","croqui","photosUploads","fotos"):  # already handled
            continue
        if k not in base:
            base[k] = v

    return base


def ensure_workbook(path: Path) -> None:
    """Garante a existência do arquivo Excel com a aba alvo."""
    if not path.exists():
        df = pd.DataFrame([])
        with pd.ExcelWriter(path, engine="openpyxl") as writer:
            df.to_excel(writer, index=False, sheet_name=SHEET_NAME)


def append_row_to_excel(row: dict) -> None:
    ensure_workbook(EXCEL_PATH)
    try:
        # Carrega aba existente
        try:
            existing = pd.read_excel(EXCEL_PATH, sheet_name=SHEET_NAME)
        except ValueError:
            # Se a aba não existir ainda
            existing = pd.DataFrame([])
        # Concatena e salva
        new_df = pd.concat([existing, pd.DataFrame([row])], ignore_index=True)
        with pd.ExcelWriter(EXCEL_PATH, engine="openpyxl") as writer:
            new_df.to_excel(writer, index=False, sheet_name=SHEET_NAME)
    except Exception:
        # Tenta fallback: criar nova aba com sufixo de data/hora
        fallback_sheet = f"{SHEET_NAME}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        with pd.ExcelWriter(EXCEL_PATH, engine="openpyxl", mode="a", if_sheet_exists="new") as writer:  # type: ignore
            pd.DataFrame([row]).to_excel(writer, index=False, sheet_name=fallback_sheet)


@app.get("/health")
def health():
    return jsonify({"ok": True, "excel": str(EXCEL_PATH), "exists": EXCEL_PATH.exists()})


@app.post("/api/relatorios")
def salvar_relatorio():
    try:
        data = request.get_json(silent=True) or {}
        row = normalize_payload(data)
        append_row_to_excel(row)
        return jsonify({"ok": True, "saved_to": str(EXCEL_PATH), "sheet": SHEET_NAME, "columns": list(row.keys())})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e), "trace": traceback.format_exc()}), 500


if __name__ == "__main__":
    # Ex.: python backend/app.py
    app.run(host="0.0.0.0", port=5000, debug=True)
