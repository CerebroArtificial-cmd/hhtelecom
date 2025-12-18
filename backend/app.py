from __future__ import annotations
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
app.config["JSON_AS_ASCII"] = False
CORS(app)


@app.get("/")
def index_root():
    return jsonify({
        "ok": True,
        "message": "API do Relatorio de Visita Externa",
        "endpoints": {
            "GET /health": "Status do backend",
            "POST /api/relatorios": "Recebe o relatorio (nao persistente)"
        }
    })


@app.get("/health")
def health():
    return jsonify({"ok": True, "timestamp": datetime.utcnow().isoformat()})


@app.post("/api/relatorios")
def salvar_relatorio():
    data = request.get_json(silent=True) or {}
    rel_id = data.get("cand") or data.get("siteId") or ""
    ts = data.get("timestamp_iso") or datetime.utcnow().isoformat()
    return jsonify({"ok": True, "relatorio_id": rel_id, "timestamp": ts})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

