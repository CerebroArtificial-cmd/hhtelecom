import requests
import json

url = "http://127.0.0.1:5000/ingest_bulk"
headers = {
    "Content-Type": "application/json",
    "X-API-Key": "chave_super_segura_12345"
}

with open("teste.json", "r", encoding="utf-8") as f:
    data = json.load(f)

response = requests.post(url, headers=headers, json=data)

print(response.status_code)
print(response.json())
