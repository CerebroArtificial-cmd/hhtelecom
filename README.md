Relatório de Buscas (Next.js + Flask)

Aplicativo web para coleta de informações em campo com checklist. Funciona offline (PWA), salva rascunhos localmente, exporta/importa JSON e envia os relatórios para um backend Flask que grava na planilha Excel existente no projeto.

Principais recursos
- Formulário em abas: Informações, Documentação, Infraestrutura, Fotos, Observações e Croqui.
- Modo offline-first: salvamento automático no navegador (localStorage) + fotos em IndexedDB.
- Exportar/Importar JSON: backup/restauração local do relatório.
- PWA: carrega mesmo sem internet (service worker simples).
- Envio para backend Flask: grava em Planilha_Visita_Site.xlsx (aba Relatorios).
- Upload opcional para Cloudinary (se variáveis configuradas); offline usa data URLs.

Arquitetura
- Frontend: Next.js App Router (TypeScript + Tailwind + shadcn/ui).
- Backend: Flask (pandas + openpyxl) escrevendo em Excel local.
- Persistência local de fotos: IndexedDB (src/lib/idb.ts).

Pastas/arquivos relevantes
- Frontend
  - src/components/ui/ReportForm.tsx (formulário principal, export/import, envio)
  - src/components/ui/PhotoChecklist.tsx (fotos + GPS + offline)
  - src/app/layout.tsx, src/app/register-sw.tsx, public/sw.js (PWA)
- Backend
  - backend/app.py (Flask API)
  - backend/requirements.txt (deps do backend)
- Dados
  - Planilha_Visita_Site.xlsx (arquivo Excel local, aba "Relatorios")

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
- A UI coleta os dados e fotos. Se Cloudinary estiver configurado e online, sobe as fotos e guarda URLs; se não, usa data URLs.
- Ao clicar em Enviar, o frontend posta para ${NEXT_PUBLIC_BACKEND_URL}/api/relatorios.
- O Flask recebe o JSON, achata campos e anexa uma linha na aba "Relatorios" de Planilha_Visita_Site.xlsx.

Variáveis de ambiente (frontend)
- NEXT_PUBLIC_BACKEND_URL (padrão: http://localhost:5000)
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME (opcional)
- NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET (opcional)

Observações
- O service worker faz cache básico para abrir a aplicação offline; atualizações podem exigir refresh.
- Se o Excel estiver aberto por outro programa, a escrita pode falhar. Feche o arquivo e tente novamente; o backend tem fallback para criar nova aba com timestamp em casos de erro.

Licença
- Uso interno.

