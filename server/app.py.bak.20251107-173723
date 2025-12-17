# server/app.py
import logging
import os
import re
import unicodedata
from datetime import datetime

import gspread
import pandas as pd
import pytz
import sqlite3
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from google.oauth2.service_account import Credentials

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SHEET_ID = os.getenv("SHEET_ID")
API_KEY = os.getenv("API_KEY", "chave_super_segura_12345")

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, "service_account.json")

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

TZ = pytz.timezone("America/Sao_Paulo")

logger.info(f"SERVICE_ACCOUNT_FILE: {SERVICE_ACCOUNT_FILE}")
logger.info(f"Existe? {os.path.exists(SERVICE_ACCOUNT_FILE)}")

creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
gc = gspread.authorize(creds)
sh = gc.open_by_key(SHEET_ID)


def resolve_worksheet(title_or_gid: str):
    """
    Resolve a worksheet by its title or gid.

    Args:
        title_or_gid (str): Worksheet title or gid as string.

    Returns:
        gspread.Worksheet: The resolved worksheet object.

    Raises:
        gspread.exceptions.WorksheetNotFound: If worksheet not found by title.
    """
    if title_or_gid.isdigit():
        logger.debug(f"Resolving worksheet by gid: {title_or_gid}")
        return sh.get_worksheet_by_id(int(title_or_gid))
    try:
        logger.debug(f"Resolving worksheet by title: {title_or_gid}")
        return sh.worksheet(title_or_gid)
    except gspread.exceptions.WorksheetNotFound:
        logger.error(f"Worksheet not found: {title_or_gid}")
        raise


def headers_for(sheet_name_or_gid: str):
    """
    Get the headers (first row) and worksheet object for a given sheet.

    Args:
        sheet_name_or_gid (str): Sheet name or gid.

    Returns:
        tuple: (list of headers, worksheet object)
    """
    ws = resolve_worksheet(sheet_name_or_gid.strip())
    headers = ws.row_values(1)
    logger.debug(f"Headers for sheet '{sheet_name_or_gid}': {headers}")
    return headers, ws


def df_from_sheet(sheet_name_or_gid: str):
    """
    Load all records from a sheet into a pandas DataFrame.

    Args:
        sheet_name_or_gid (str): Sheet name or gid.

    Returns:
        pd.DataFrame: DataFrame with sheet data.
    """
    ws = resolve_worksheet(sheet_name_or_gid.strip())
    records = ws.get_all_records()
    df = pd.DataFrame(records)
    logger.debug(f"Loaded {len(df)} rows from sheet '{sheet_name_or_gid}'")
    return df


def check_api_key(req) -> bool:
    """
    Check if the request contains a valid API key.

    Args:
        req (flask.Request): Incoming request object.

    Returns:
        bool: True if API key is valid or not required, False otherwise.
    """
    if not API_KEY:
        logger.debug("No API key required.")
        return True
    valid = req.headers.get("X-API-Key") == API_KEY
    logger.debug(f"API key valid: {valid}")
    return valid


IDEMP_DB = os.getenv("IDEMP_DB") or os.path.join(BASE_DIR, "idempotency.db")


def idem_conn():
    """
    Create or open a connection to the idempotency SQLite database.

    Returns:
        sqlite3.Connection: SQLite connection object.
    """
    conn = sqlite3.connect(IDEMP_DB)
    conn.execute("CREATE TABLE IF NOT EXISTS seen (key TEXT PRIMARY KEY)")
    logger.debug("Opened idempotency DB connection.")
    return conn


def already_seen(key: str) -> bool:
    """
    Check if a given idempotency key has already been seen.

    Args:
        key (str): Idempotency key.

    Returns:
        bool: True if key was seen before, False otherwise.
    """
    if not key:
        return False
    conn = idem_conn()
    try:
        cur = conn.execute("SELECT 1 FROM seen WHERE key=?", (key,))
        seen = cur.fetchone() is not None
        logger.debug(f"Key '{key}' already seen: {seen}")
        return seen
    finally:
        conn.close()


def mark_seen(key: str):
    """
    Mark an idempotency key as seen in the database.

    Args:
        key (str): Idempotency key.
    """
    if not key:
        return
    conn = idem_conn()
    try:
        conn.execute("INSERT OR IGNORE INTO seen(key) VALUES (?)", (key,))
        conn.commit()
        logger.debug(f"Marked key '{key}' as seen.")
    finally:
        conn.close()


TRUE_SET = {"sim", "true", "verdadeiro", "1", "yes", "y", "on"}
FALSE_SET = {"não", "nao", "false", "falso", "0", "no", "n", "off"}


def normalize_value(v):
    """
    Normalize a value from the input, converting strings to booleans or None.

    Args:
        v: Input value.

    Returns:
        Normalized value: True, False, None, or original string/value.
    """
    if v is None:
        return None
    if isinstance(v, str):
        s = v.strip()
        if not s:
            return None
        low = s.lower()
        if low in TRUE_SET:
            return True
        if low in FALSE_SET:
            return False
        return s
    return v


def append_in_chunks(ws, values, chunk_size=200):
    """
    Append rows to a worksheet in chunks.

    Args:
        ws (gspread.Worksheet): Worksheet to append to.
        values (list): List of rows (lists) to append.
        chunk_size (int): Number of rows per chunk.

    Returns:
        int: Number of rows appended.
    """
    total = len(values)
    if total == 0:
        return 0
    appended = 0
    for i in range(0, total, chunk_size):
        batch = values[i : i + chunk_size]
        ws.append_rows(batch, value_input_option="USER_ENTERED")
        appended += len(batch)
    logger.debug(f"Appended {appended} rows in chunks of {chunk_size}.")
    return appended


@app.get("/")
def index():
    """
    Root endpoint returning API info and available endpoints.

    Returns:
        flask.Response: JSON response with API metadata.
    """
    return jsonify(
        {
            "ok": True,
            "message": "API do Relatório de Visita Externa",
            "endpoints": {
                "GET /health": "Status e lista de abas",
                "GET /schema": "Cabeçalhos (linha 1) de cada aba",
                "GET /dados?sheet=Nome%20da%20Aba": "Lê os dados de uma aba",
                "GET /dados_all": "Lê os dados de todas as abas",
                "POST /ingest_bulk": "Insere em lote nas abas",
            },
        }
    )


@app.get("/health")
def health():
    """
    Health check endpoint returning worksheets and server time.

    Returns:
        flask.Response: JSON with status, worksheets list, and server time.
    """
    try:
        worksheets = [w.title for w in sh.worksheets()]
        server_time = datetime.now(TZ).isoformat()
        logger.info("Health check successful.")
        return jsonify({"ok": True, "worksheets": worksheets, "server_time": server_time})
    except Exception as e:
        logger.error(f"Health check failed: {type(e).__name__} {e}")
        return jsonify({"ok": False, "erro": type(e).__name__, "detalhe": str(e)}), 500


@app.get("/schema")
def schema():
    """
    Return the headers (first row) of each worksheet.

    Returns:
        flask.Response: JSON with sheet names and their headers.
    """
    try:
        data = {ws.title: ws.row_values(1) for ws in sh.worksheets()}
        logger.info("Schema retrieved successfully.")
        return jsonify({"ok": True, "schema": data})
    except Exception as e:
        logger.error(f"Schema retrieval failed: {type(e).__name__} {e}")
        return jsonify({"ok": False, "erro": type(e).__name__, "detalhe": str(e)}), 500


@app.get("/dados")
def dados():
    """
    Return data from a specified sheet.

    Query Parameters:
        sheet (str): Name of the sheet.

    Returns:
        flask.Response: JSON with sheet data or error.
    """
    sheet = request.args.get("sheet")
    if not sheet:
        logger.warning("Missing 'sheet' parameter in /dados request.")
        return jsonify({"ok": False, "erro": "Informe ?sheet=Nome da Aba"}), 400
    try:
        df = df_from_sheet(sheet)
        logger.info(f"Data retrieved from sheet '{sheet}', rows: {len(df)}")
        return jsonify({"ok": True, "sheet": sheet, "rows": len(df), "data": df.to_dict(orient="records")})
    except gspread.exceptions.WorksheetNotFound:
        logger.warning(f"Worksheet not found: {sheet}")
        return (
            jsonify({"ok": False, "erro": "WorksheetNotFound", "detalhe": f"A aba '{sheet}' não existe."}),
            404,
        )
    except Exception as e:
        logger.error(f"Error retrieving data from sheet '{sheet}': {type(e).__name__} {e}")
        return jsonify({"ok": False, "erro": type(e).__name__, "detalhe": str(e)}), 500


@app.get("/dados_all")
def dados_all():
    """
    Return data from all worksheets.

    Returns:
        flask.Response: JSON with all sheets data or error.
    """
    try:
        out = {}
        for ws in sh.worksheets():
            out[ws.title] = ws.get_all_records()
        logger.info("Data retrieved from all sheets.")
        return jsonify({"ok": True, "sheets": list(out.keys()), "data": out})
    except Exception as e:
        logger.error(f"Error retrieving all sheets data: {type(e).__name__} {e}")
        return jsonify({"ok": False, "erro": type(e).__name__, "detalhe": str(e)}), 500


@app.get("/debug_sheets")
def debug_sheets():
    """
    Debug endpoint returning sheet IDs and worksheet info.

    Returns:
        flask.Response: JSON with sheet and worksheet metadata.
    """
    try:
        data = {
            "ok": True,
            "sheet_id": sh.id,
            "worksheets": [{"title": ws.title, "gid": ws.id} for ws in sh.worksheets()],
        }
        logger.info("Debug sheets info retrieved.")
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error in debug_sheets: {type(e).__name__} {e}")
        return jsonify({"ok": False, "erro": type(e).__name__, "detalhe": str(e)}), 500


@app.post("/ingest_bulk")
def ingest_bulk():
    """
    Bulk ingest endpoint to insert rows into multiple sheets.

    Expects JSON payload with optional batch_id, device_id, user_id, captured_at,
    and a 'sheets' dictionary mapping sheet names to lists of row dicts.

    Returns:
        flask.Response: JSON with ingestion results or error.
    """
    if not check_api_key(request):
        logger.warning("Unauthorized access attempt to /ingest_bulk.")
        return jsonify({"ok": False, "erro": "unauthorized"}), 401

    payload = request.get_json(silent=True) or {}
    if not isinstance(payload, dict) or "sheets" not in payload:
        logger.warning("Invalid payload in /ingest_bulk.")
        return (
            jsonify(
                {
                    "ok": False,
                    "erro": "payload_invalido",
                    "detalhe": "Esperado { batch_id?, device_id?, user_id?, captured_at?, sheets:{<Aba>:[{...}]}}",
                }
            ),
            400,
        )

    batch_id = payload.get("batch_id")
    device_id = payload.get("device_id")
    user_id = payload.get("user_id")
    captured_at = payload.get("captured_at")
    sheets_map = payload.get("sheets", {})

    if batch_id and already_seen(f"batch:{batch_id}"):
        logger.info(f"Duplicate batch detected: {batch_id}")
        return jsonify(
            {
                "ok": True,
                "duplicated_batch": True,
                "results": {
                    "batch_id": batch_id,
                    "accepted": 0,
                    "duplicates": 0,
                    "errors": 0,
                    "by_sheet": {},
                },
            }
        )

    server_synced_at = datetime.now(TZ).isoformat()
    results = {"batch_id": batch_id, "accepted": 0, "duplicates": 0, "errors": 0, "by_sheet": {}}

    try:
        for sheet_name, rows in sheets_map.items():
            if not isinstance(rows, list) or not rows:
                logger.debug(f"Skipping empty or invalid rows for sheet '{sheet_name}'.")
                continue

            try:
                headers, ws = headers_for(sheet_name)
            except Exception:
                logger.error(f"Worksheet not found during ingest_bulk: {sheet_name}")
                results["by_sheet"][sheet_name] = [{"error": "WorksheetNotFound"}] * len(rows)
                results["errors"] += len(rows)
                continue

            values_to_append = []
            line_results = []

            for r in rows:
                line_key = r.get("idempotency_key")
                if line_key and already_seen(f"line:{line_key}"):
                    line_results.append({"idempotency_key": line_key, "status": "duplicate"})
                    results["duplicates"] += 1
                    continue

                r = dict(r)  # copy to avoid mutating caller
                r.setdefault("_device_id", device_id)
                r.setdefault("_user_id", user_id)
                r.setdefault("_captured_at", captured_at)
                r.setdefault("_server_synced_at", server_synced_at)

                row_values = [normalize_value(r.get(h)) for h in headers]
                values_to_append.append(row_values)
                line_results.append({"idempotency_key": line_key, "status": "queued"})

            appended = append_in_chunks(ws, values_to_append, chunk_size=200)
            results["accepted"] += appended

            for lr in line_results:
                if lr.get("status") == "queued" and lr.get("idempotency_key"):
                    mark_seen(f"line:{lr['idempotency_key']}")

            results["by_sheet"][sheet_name] = line_results

        if batch_id:
            mark_seen(f"batch:{batch_id}")

        logger.info(f"Ingest bulk completed: batch_id={batch_id}, accepted={results['accepted']}, duplicates={results['duplicates']}, errors={results['errors']}")
        return jsonify({"ok": True, "results": results})

    except Exception as e:
        logger.error(f"Error in ingest_bulk: {type(e).__name__} {e}")
        return jsonify({"ok": False, "erro": type(e).__name__, "detalhe": str(e)}), 500


@app.post("/ingest_bulk/FotosChecklist")
def ingest_fotos_checklist_bulk():
    """
    Specialized bulk ingest endpoint for 'Fotos Checklist' sheet.

    Expects JSON payload with 'rows' list and optional batch_id, device_id, user_id, captured_at.

    Returns:
        flask.Response: JSON with ingestion results or error.
    """
    if not check_api_key(request):
        logger.warning("Unauthorized access attempt to /ingest_bulk/FotosChecklist.")
        return jsonify({"ok": False, "erro": "unauthorized"}), 401

    body = request.get_json(silent=True) or {}

    rows = body.get("rows")
    if not isinstance(rows, list) or not rows:
        logger.warning("Invalid payload in /ingest_bulk/FotosChecklist.")
        return (
            jsonify(
                {
                    "ok": False,
                    "erro": "payload_invalido",
                    "detalhe": "Esperado { rows: [ {...}, ... ] }",
                }
            ),
            400,
        )

    payload = {
        "batch_id": body.get("batch_id"),
        "device_id": body.get("device_id"),
        "user_id": body.get("user_id"),
        "captured_at": body.get("captured_at"),
        "sheets": {"Fotos Checklist": rows},
    }

    with app.test_request_context(json=payload, headers=request.headers):
        return ingest_bulk()


if __name__ == "__main__":
    try:
        logger.info(f"Diretório atual: {os.getcwd()}")
        logger.info(f"Arquivo JSON existe? {os.path.exists(SERVICE_ACCOUNT_FILE)}")
        _titles = [w.title for w in sh.worksheets()]
        logger.info(f"Abas encontradas: {_titles}")
    except Exception as e:
        logger.error(f"Falha ao inicializar Sheets: {type(e).__name__} {e}")
    app.run(host="0.0.0.0", port=5000, debug=True)