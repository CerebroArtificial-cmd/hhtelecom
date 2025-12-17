from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

SPREADSHEET_ID = "1ZNc9YQH-3fYZWFf87Pv57NiquPIMLJSd091zIxI6_mM"
SHEET_ID = 1977077338  # gid da "Fotos Checklist"

# Cabeçalhos desejados (na ordem que você quer manter na planilha)
HEADERS = [
    "idempotency_key",
    "site_id",
    "foto_item",
    "arquivo_url",
    "observacao",
    "origem_campo",
    "created_at",
]

rows_payload = [
    {
        "idempotency_key": "fotos-00006",
        "site_id": "SITE_001",
        "foto_item": "RUA DE ACESSO AO IMÓVEL (direita)",
        "arquivo_url": "https://exemplo.com/foto1.jpg",
        "observacao": "Foto tirada às 13h.",
        "origem_campo": "rua_de_acesso_ao_imovel_direita",
        "created_at": "2025-11-07T13:05:00-03:00",
    }
]

SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
creds = Credentials.from_service_account_file("service_account.json", scopes=SCOPES)
sheets = build("sheets", "v4", credentials=creds)

def celldata_str(s):  # ajuda a criar células string
    return {"userEnteredValue": {"stringValue": "" if s is None else str(s)}}

# 1) Lê a primeira linha (cabeçalhos atuais) usando GridData por sheetId
meta = sheets.spreadsheets().get(
    spreadsheetId=SPREADSHEET_ID,
    ranges=[],
    includeGridData=False
).execute()

# Descobre o título/nome da aba (opcional) e alguns props
sheet_props = None
for sh in meta["sheets"]:
    if sh["properties"]["sheetId"] == SHEET_ID:
        sheet_props = sh["properties"]
        break
assert sheet_props, "sheetId não encontrado."

# Para ler cabeçalho com Values API, precisamos do nome da aba (title)
sheet_title = sheet_props["title"]

# Lê a linha 1 (pode estar vazia)
hdr_resp = sheets.spreadsheets().values().get(
    spreadsheetId=SPREADSHEET_ID,
    range=f"'{sheet_title}'!1:1"
).execute()
current_headers = hdr_resp.get("values", [[]])
current_headers = current_headers[0] if current_headers else []

# 2) Se não houver cabeçalho, cria; se houver, adiciona colunas que faltam (à direita)
requests = []
if not current_headers:
    # Cria cabeçalho na linha 1 com HEADERS
    requests.append({
        "updateCells": {
            "rows": [{
                "values": [celldata_str(h) for h in HEADERS]
            }],
            "fields": "userEnteredValue",
            "range": {
                "sheetId": SHEET_ID,
                "startRowIndex": 0, "endRowIndex": 1,
                "startColumnIndex": 0, "endColumnIndex": len(HEADERS)
            }
        }
    })
    effective_headers = HEADERS[:]
else:
    effective_headers = current_headers[:]
    missing = [h for h in HEADERS if h not in effective_headers]
    if missing:
        # Escreve “missing” à direita do cabeçalho existente
        start_col = len(effective_headers)
        requests.append({
            "updateCells": {
                "rows": [{
                    "values": [celldata_str(h) for h in missing]
                }],
                "fields": "userEnteredValue",
                "range": {
                    "sheetId": SHEET_ID,
                    "startRowIndex": 0, "endRowIndex": 1,
                    "startColumnIndex": start_col,
                    "endColumnIndex": start_col + len(missing)
                }
            }
        })
        effective_headers.extend(missing)

# 3) Monta “appendCells” alinhando cada objeto às colunas efetivas
def dict_to_row(d, headers):
    return [celldata_str(d.get(h, "")) for h in headers]

if rows_payload:
    requests.append({
        "appendCells": {
            "sheetId": SHEET_ID,
            "rows": [{"values": dict_to_row(r, effective_headers)} for r in rows_payload],
            "fields": "userEnteredValue"
        }
    })

if requests:
    resp = sheets.spreadsheets().batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body={"requests": requests}
    ).execute()
    print("BatchUpdate ok. Replies:", resp.get("replies"))
else:
    print("Nada a fazer (sem linhas ou cabeçalhos).")
