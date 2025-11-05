import requests

# IMPORTANTE: Este link é a página de visualização do Google Sheets e NÃO aceita POST.
# Para enviar dados para uma planilha Google via HTTP, crie um Web App no Google Apps Script
# que receba POST e escreva na planilha, e substitua abaixo pelo URL do seu Web App.
# Exemplo de placeholder:
link = "https://script.google.com/macros/s/SEU_DEPLOY_ID/exec"  # substitua pelo seu endpoint Apps Script

payload = {
    "mensagem": "Exemplo de envio",
    "autor": "CTM",
    "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
}

try:
    r = requests.post(link, json=payload, timeout=15)
    print("status:", r.status_code)
    print("resposta:", r.text)
except requests.RequestException as e:
    print("falha na requisição:", e)
