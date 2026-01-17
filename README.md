Relatorio de Visita Externa (Next.js)

Aplicativo web para coleta de informacoes em campo com checklist. Envio para backend via API configurada no frontend.

Principais recursos
- Formulario em abas: Informacoes, Documentacao, Infraestrutura, Fotos, Observacoes e Croqui.
- Exportar JSON: backup/restauracao local do relatorio.
- Envio para backend (opcional) via API configurada no frontend.

Arquitetura
- Frontend: Next.js App Router (TypeScript + Tailwind + shadcn/ui).
- Backend: FastAPI + MySQL (backend/)

Pastas/arquivos relevantes
- Frontend
  - src/components/ui/ReportForm.tsx (formulario principal, exportacao, envio)
  - src/components/ui/PhotoChecklist.tsx (fotos + GPS)
  - src/app/layout.tsx
- Backend
  - backend/app/main.py (API FastAPI)
  - backend/app/routers/relatorios.py (rotas)
  - backend/app/models.py (modelos SQLAlchemy)
  - backend/README.md (setup)

Como rodar (desenvolvimento)
1) Frontend Next.js
   - npm install
   - Opcional: crie .env.local com:
     - NEXT_PUBLIC_BACKEND_URL=https://seu-backend
   - npm run dev
   - Acesse: http://localhost:3000

2) Backend FastAPI
   - cd backend
   - pip install -r requirements.txt
   - copie .env.example para .env e ajuste DATABASE_URL
   - uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

Fluxo de envio
- A UI coleta os dados e fotos.
- Ao clicar em Enviar, o frontend posta para ${NEXT_PUBLIC_BACKEND_URL}/api/relatorios (se configurado).

Variaveis de ambiente (frontend)
- NEXT_PUBLIC_BACKEND_URL (opcional)

Observacoes
- As fotos sao salvas no backend como arquivo (storage) e o banco guarda apenas o path/url.

Licenca
- Uso interno.
