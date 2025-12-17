import os
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, "service_account.json")
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]
SHEET_ID = "1RSn7TVwMNqOf4FAchKVRv4RfUoecUltv-dLdUR6unn4"

print("🔍 JSON existe?", os.path.exists(SERVICE_ACCOUNT_FILE))
creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)

# Drive: já sabemos que funciona, mas mantém aqui como controle
drive = build("drive", "v3", credentials=creds)
meta = drive.files().get(fileId=SHEET_ID, fields="id,name,mimeType,permissions(emailAddress,role)").execute()
print("✅ Drive OK —", meta["name"], meta["mimeType"])

# >>> Sheets API (chamada direta, sem gspread)
sheets = build("sheets", "v4", credentials=creds)
try:
    resp = sheets.spreadsheets().get(spreadsheetId=SHEET_ID).execute()
    titles = [s["properties"]["title"] for s in resp.get("sheets", [])]
    print("✅ Sheets API OK — abas:", titles)
except Exception as e:
    # Mostra mensagem completa da API (inclui JSON com motivo do 403, se for o caso)
    import traceback
    print("❌ Sheets API ERRO:", type(e).__name__, str(e))
    traceback.print_exc()

