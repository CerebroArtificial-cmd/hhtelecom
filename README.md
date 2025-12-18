Relatorio de Visita Externa (Next.js)

Aplicativo web para coleta de informacoes em campo com checklist. Funciona offline (PWA), salva rascunhos localmente e exporta/importa JSON.

Principais recursos
- Formulario em abas: Informacoes, Documentacao, Infraestrutura, Fotos, Observacoes e Croqui.
- Modo offline-first: salvamento automatico no navegador (localStorage) + fotos em IndexedDB.
- Exportar/Importar JSON: backup/restauracao local do relatorio.
- PWA: carrega mesmo sem internet (service worker simples).
- Envio para backend (opcional) via API configurada no frontend.

Arquitetura
- Frontend: Next.js App Router (TypeScript + Tailwind + shadcn/ui).
- Persistencia local de fotos: IndexedDB (src/lib/idb.ts).

Pastas/arquivos relevantes
- Frontend
  - src/components/ui/ReportForm.tsx (formulario principal, export/import, envio)
  - src/components/ui/PhotoChecklist.tsx (fotos + GPS + offline)
  - src/app/layout.tsx, src/app/register-sw.tsx, public/sw.js (PWA)
Como rodar (desenvolvimento)
1) Frontend Next.js
   - npm install
   - Opcional: crie .env.local com:
     - NEXT_PUBLIC_BACKEND_URL=https://seu-backend
   - npm run dev
   - Acesse: http://localhost:3000

Fluxo de envio
- A UI coleta os dados e fotos e salva localmente no dispositivo.
- Ao clicar em Enviar, o frontend posta para ${NEXT_PUBLIC_BACKEND_URL}/api/relatorios (se configurado).

Variaveis de ambiente (frontend)
- NEXT_PUBLIC_BACKEND_URL (opcional)

Observacoes
- O service worker faz cache basico para abrir a aplicacao offline; atualizacoes podem exigir refresh.

Licenca
- Uso interno.
