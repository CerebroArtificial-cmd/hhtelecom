Relatorio de Visita Externa (Next.js + Flask)

Aplicativo web para coleta de informacoes em campo com checklist. Funciona offline (PWA), salva rascunhos localmente, exporta/importa JSON e envia os relatorios para um backend Flask.

Principais recursos
- Formulario em abas: Informacoes, Documentacao, Infraestrutura, Fotos, Observacoes e Croqui.
- Modo offline-first: salvamento automatico no navegador (localStorage) + fotos em IndexedDB.
- Exportar/Importar JSON: backup/restauracao local do relatorio.
- PWA: carrega mesmo sem internet (service worker simples).
- Envio para backend Flask: recebe o JSON (sem persistencia no servidor).
- Upload opcional para Cloudinary (se variaveis configuradas); offline usa data URLs.

Arquitetura
- Frontend: Next.js App Router (TypeScript + Tailwind + shadcn/ui).
- Backend: Flask (API simples, sem armazenamento).
- Persistencia local de fotos: IndexedDB (src/lib/idb.ts).

Pastas/arquivos relevantes
- Frontend
  - src/components/ui/ReportForm.tsx (formulario principal, export/import, envio)
  - src/components/ui/PhotoChecklist.tsx (fotos + GPS + offline)
  - src/app/layout.tsx, src/app/register-sw.tsx, public/sw.js (PWA)
- Backend
  - backend/app.py (Flask API)
  - backend/requirements.txt (deps do backend)

Como rodar (desenvolvimento)
1) Backend Flask
   - python -m venv .venv
   - .\.venv\Scripts\Activate.ps1   (Windows PowerShell)
   - pip install -r backend/requirements.txt
   - python backend/app.py
   - Endpoints:
     - GET  http://localhost:5000/health
     - POST http://localhost:5000/api/relatorios

2) Frontend Next.js
   - npm install
   - Opcional: crie .env.local com:
     - NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
     - (opcional) NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud
     - (opcional) NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET=seu_preset
   - npm run dev
   - Acesse: http://localhost:3000
   - Para rodar backend e frontend juntos: npm run dev:full

Fluxo de envio
- A UI coleta os dados e fotos. Se Cloudinary estiver configurado e online, sobe as fotos e guarda URLs; se nao, usa data URLs.
- Ao clicar em Enviar, o frontend posta para ${NEXT_PUBLIC_BACKEND_URL}/api/relatorios.
- O Flask recebe o JSON e retorna ok (sem salvar).

Variaveis de ambiente (frontend)
- NEXT_PUBLIC_BACKEND_URL (padrao: http://localhost:5000)
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME (opcional)
- NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET (opcional)

Observacoes
- O service worker faz cache basico para abrir a aplicacao offline; atualizacoes podem exigir refresh.

Licenca
- Uso interno.
