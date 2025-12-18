Relatório de Visita Externa - TODO

Geral
- [ ] Padronizar rótulos PT-BR (acentos/termos CTM)
- [ ] Validar obrigatórios por aba (mínimos de fotos, campos chave)
- [ ] Indicadores de progresso por aba e erros em destaque
- [ ] Melhorar máscaras de entrada (telefone, CEP, moeda)

Backend (Flask)
- [ ] Sanitizar payload (whitelist/casting) antes de gravar

Frontend (Next.js)
- [x] Enviar para BACKEND_URL em vez de Make
- [x] PWA (service worker simples)
- [x] Offline-first (localStorage + IndexedDB para fotos)
- [x] Exportar/Importar JSON
- [ ] Spinner/feedback no botão Enviar
- [ ] Acessibilidade (labels, aria-*, foco, contraste)
- [x] Responsividade mobile (inputs touch-friendly)

Fotos
- [x] Compressão no cliente
- [x] Captura de GPS (botão “Usar GPS”)
- [ ] Validar contadores (ex.: 12 fotos 360°)

Documentação
- [x] README atualizado
- [ ] Guia de troubleshooting (CORS, offline)
- [ ] Checklist de publicação

