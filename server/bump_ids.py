import json, uuid, datetime

path = "teste.json"

with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

# novo batch_id com timestamp
ts = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
data["batch_id"] = f"lote-{ts}"

# se houver idempotency_key nas linhas, regenere
sheets = data.get("sheets", {})
for sheet_key, rows in sheets.items():
    if isinstance(rows, list):
        for r in rows:
            if "idempotency_key" in r:
                r["idempotency_key"] = str(uuid.uuid4())

with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("OK! batch_id e idempotency_key(s) atualizados.")
