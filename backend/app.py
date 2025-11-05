from __future__ import annotations
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
from pathlib import Path
from datetime import datetime
import traceback
import unicodedata

# Caminho da planilha existente no repositório
ROOT = Path(__file__).resolve().parent.parent
EXCEL_PATH = ROOT / "Planilha_Visita_Site.xlsx"

app = Flask(__name__)
# Garante JSON UTF-8 (sem \uXXXX)
app.config['JSON_AS_ASCII'] = False
CORS(app)


def ensure_workbook(path: Path) -> None:
    if not path.exists():
        with pd.ExcelWriter(path, engine="openpyxl") as writer:
            pd.DataFrame([]).to_excel(writer, index=False, sheet_name="Init")


def _norm_str(s):
    try:
        return unicodedata.normalize('NFC', str(s))
    except Exception:
        return s


def append_dict_to_sheet(sheet_name: str, row: dict) -> None:
    ensure_workbook(EXCEL_PATH)
    # normaliza strings (NFC) para evitar problemas de acentuação
    norm_row = { _norm_str(k): (_norm_str(v) if isinstance(v, str) else v) for k, v in row.items() }
    df_row = pd.DataFrame([norm_row])
    if EXCEL_PATH.exists():
        try:
            existing = pd.read_excel(EXCEL_PATH, sheet_name=sheet_name)
            # alinhar colunas (união)
            for col in df_row.columns:
                if col not in existing.columns:
                    existing[col] = ""
            for col in existing.columns:
                if col not in df_row.columns:
                    df_row[col] = ""
            new_df = pd.concat([existing, df_row], ignore_index=True)
        except ValueError:
            # aba não existe ainda
            new_df = df_row
        # escreve apenas essa aba, preservando as demais
        with pd.ExcelWriter(EXCEL_PATH, engine="openpyxl", mode="a", if_sheet_exists="replace") as writer:  # type: ignore
            new_df.to_excel(writer, index=False, sheet_name=sheet_name)
    else:
        with pd.ExcelWriter(EXCEL_PATH, engine="openpyxl") as writer:
            df_row.to_excel(writer, index=False, sheet_name=sheet_name)


# Chaves por seção/aba
INFO_KEYS = [
    "siteId","dataVisita","siteType","cidade","proprietario","telefone","representante",
    "cand","cord","enderecoSite","bairro","cep"
]
DOC_KEYS = [
    "iptuItr","escrituraParticular","contratoCompraVenda","matriculaCartorio","escrituraPublica",
    "inventario","contaConcessionaria","tempoDocumento","telefoneDoc","proposta","contraProposta","resumoHistorico"
]
INFRA_KEYS = [
    "terrenoPlano","arvoreArea","construcaoArea","medidasArea"
]
ELETRICOS_KEYS = [
    "energia","energiaTipo","energiaVoltagem","extensaoRede","metrosExtensao","coordenadasPontoNominal"
]
CROQUI_KEYS = [
    "tamanhoTerreno","vegetacaoExistente","construcoesTerreno","acesso","niveisTerreno","observacoesGerais"
]
REGRAS_KEYS = [
    "regraRodovia40","regraRio50","regraColegio50","regraHospital50","regraAreaLivre","regraArvoresEspecie","regrasObs"
]


def pick(d: dict, keys: list[str]) -> dict:
    return {k: d.get(k, "") for k in keys if k in d}


@app.get("/health")
def health():
    return jsonify({"ok": True, "excel": str(EXCEL_PATH), "exists": EXCEL_PATH.exists()})


@app.get("/api/sheets")
def list_sheets():
    try:
        name = request.args.get("name")
        if name:
            limit = int(request.args.get("limit", "200"))
            offset = int(request.args.get("offset", "0"))
            ensure_workbook(EXCEL_PATH)
            df = pd.read_excel(EXCEL_PATH, sheet_name=name)
            df = df.fillna("")
            if offset:
                df = df.iloc[offset:]
            if limit:
                df = df.iloc[:limit]
            # normaliza strings
            rows = []
            for r in df.to_dict(orient="records"):
                rows.append({ _norm_str(k): (_norm_str(v) if isinstance(v, str) else v) for k, v in r.items() })
            return jsonify({"ok": True, "count": len(rows), "rows": rows})
        else:
            ensure_workbook(EXCEL_PATH)
            xls = pd.ExcelFile(EXCEL_PATH)
            sheets = [_norm_str(s) for s in xls.sheet_names]
            return jsonify({"ok": True, "sheets": sheets})
    except FileNotFoundError:
        return jsonify({"ok": False, "error": "Arquivo Excel não encontrado"}), 404
    except ValueError:
        return jsonify({"ok": False, "error": "Aba não encontrada"}), 404
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.get("/api/sheets/<sheet_name>")
def read_sheet(sheet_name: str):
    try:
        limit = int(request.args.get("limit", "200"))
        offset = int(request.args.get("offset", "0"))
        df = pd.read_excel(EXCEL_PATH, sheet_name=sheet_name)
        df = df.fillna("")
        if offset:
            df = df.iloc[offset:]
        if limit:
            df = df.iloc[:limit]
        rows = []
        for r in df.to_dict(orient="records"):
            rows.append({ _norm_str(k): (_norm_str(v) if isinstance(v, str) else v) for k, v in r.items() })
        return jsonify({"ok": True, "count": len(rows), "rows": rows})
    except FileNotFoundError:
        return jsonify({"ok": False, "error": "Arquivo Excel não encontrado"}), 404
    except ValueError as ve:
        return jsonify({"ok": False, "error": f"Aba não encontrada: {sheet_name}"}), 404
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.get("/download/xlsx")
def download_xlsx():
    try:
        ensure_workbook(EXCEL_PATH)
        return send_file(EXCEL_PATH, as_attachment=True, download_name=EXCEL_PATH.name)
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@app.post("/api/relatorios")
def salvar_relatorio():
    try:
        data = request.get_json(silent=True) or {}
        ts = data.get("timestamp_iso") or datetime.utcnow().isoformat()
        rel_id = data.get("cand") or data.get("siteId") or ""
        common = {"timestamp_iso": ts, "relatorio_id": rel_id}

        # Informações do Site
        info = pick(data, INFO_KEYS)
        if info:
            append_dict_to_sheet("Informações do Site", {**common, **info})
        # Documentação
        doc = pick(data, DOC_KEYS)
        if doc:
            append_dict_to_sheet("Documentação", {**common, **doc})
        # Infraestrutura
        infra = pick(data, INFRA_KEYS)
        if infra:
            append_dict_to_sheet("Infraestrutura", {**common, **infra})
        # Dados Eletricos e Medição
        eletr = pick(data, ELETRICOS_KEYS)
        if eletr:
            if isinstance(eletr.get("energiaTipo"), list):
                eletr["energiaTipo"] = ", ".join(eletr["energiaTipo"])  # type: ignore
            if isinstance(eletr.get("energiaVoltagem"), list):
                eletr["energiaVoltagem"] = ", ".join(eletr["energiaVoltagem"])  # type: ignore
            append_dict_to_sheet("Dados Eletricos e Medição", {**common, **eletr})
        # Croqui e Anotações
        croqui = pick(data, CROQUI_KEYS)
        if croqui:
            append_dict_to_sheet("Croqui e Anotações", {**common, **croqui})
        # Regras e Observações
        regras = pick(data, REGRAS_KEYS)
        if regras:
            append_dict_to_sheet("Regras e Observações", {**common, **regras})
        # Fotos (Make schema)
        fotos = data.get("photosUploads") or {}
        if isinstance(fotos, dict):
            for k, v in fotos.items():
                imgs = (v or {}).get("images") or (v or {}).get("urls") or (v or {}).get("files") or []
                coords_text = (v or {}).get("coordsText") or (v or {}).get("coords") or ""
                urls = (v or {}).get("urls")
                row = {**common, "foto_id": _norm_str(k), "qtd": len(imgs), "coords": _norm_str(coords_text), "urls": ", ".join(urls) if isinstance(urls, list) else ""}
                append_dict_to_sheet("Fotos (Make schema)", row)

        return jsonify({"ok": True, "saved_to": str(EXCEL_PATH)})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e), "trace": traceback.format_exc()}), 500


if __name__ == "__main__":
    # Ex.: python backend/app.py
    app.run(host="0.0.0.0", port=5000, debug=True)
