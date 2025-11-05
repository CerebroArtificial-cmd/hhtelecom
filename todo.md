Relatório de Visita Externa - TODO

Geral
- [ ] Padronizar rótulos PT-BR (acentos/termos CTM)
- [ ] Validar obrigatórios por aba (mínimos de fotos, campos chave)
- [ ] Indicadores de progresso por aba e erros em destaque
- [ ] Melhorar máscaras de entrada (telefone, CEP, moeda)

Backend (Flask + Excel)
- [x] API /api/relatorios grava em Planilha_Visita_Site.xlsx (aba Relatorios)
- [ ] Sanitizar payload (whitelist/casting) antes de gravar
- [ ] Tratar arquivo bloqueado/aberto e mensagens de erro mais claras
- [ ] Rotina de backup/rotação do Excel (opcional)

Frontend (Next.js)
- [x] Enviar para BACKEND_URL em vez de Make
- [x] PWA (service worker simples)
- [x] Offline-first (localStorage + IndexedDB para fotos)
- [x] Exportar/Importar JSON
- [ ] Spinner/feedback no botão Enviar
- [ ] Acessibilidade (labels, aria-*, foco, contraste)
- [ ] Responsividade mobile (inputs touch-friendly)

Fotos
- [x] Compressão no cliente
- [x] Captura de GPS (botão “Usar GPS”)
- [ ] Validar contadores (ex.: 12 fotos 360°)
- [ ] Avisos quando Cloudinary não estiver configurado e usuário esperar upload

Documentação
- [x] README atualizado para Flask/Excel
- [ ] Guia de troubleshooting (Excel aberto, CORS, offline)
- [ ] Checklist de publicação
