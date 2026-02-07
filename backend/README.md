# Backend - Relatorio de Visita Externa

Backend FastAPI com SQLite e armazenamento de fotos em arquivo (storage local).

## Requisitos
- Python 3.11+
- MySQL 8+

## Setup rapido
1) Crie e ative um virtualenv
2) Instale dependencias:
   pip install -r requirements.txt
3) Copie .env.example para .env e ajuste as variaveis
4) Crie o banco no MySQL
5) Crie as tabelas:
   python -m app.init_db
6) Rode:
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Opcional (rodando da raiz do projeto):
   uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000

## Variaveis
- DATABASE_URL: string de conexao MySQL
- CORS_ORIGINS: lista separada por virgula
- STORAGE_BACKEND: local (por enquanto)
- STORAGE_DIR: pasta onde os arquivos serao salvos
- STORAGE_PUBLIC_BASE_URL: base URL publica para montar os links

## Notas
- O frontend envia fotos em base64 dentro de photosUploads.
- O backend salva em arquivo e grava apenas o path/url no MySQL.
- Para usar storage externo, substitua o metodo save_data_url em app/storage.py.
