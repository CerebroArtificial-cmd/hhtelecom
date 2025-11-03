Relatório de Visita Externa - MVP Todo List

- [ ] Revisar e padronizar todos os rótulos PT‑BR nos componentes (acentuação, termos CTM)
- [ ] Mapear IDs dos itens de foto para rótulos CTM exatos (ex.: Frente 1/2, Rua Acesso dir/esq, etc.)
- [ ] Validar obrigatórios por aba (mínimos de fotos, campos chave como siteType, cidade, proprietário)
- [ ] Indicadores de progresso por aba e erros em destaque (UX)
- [ ] Melhorar máscara/normalização (telefone, CEP, moeda) na entrada do usuário

Integração Make.com
- [x] Enviar dados normalizados via builder (send-report) para o Make (webhook)
- [ ] Adicionar exemplo de payload no README para facilitar mapeamento no Make
- [ ] Implementar retentativas/retry simples no frontend em falha de rede
- [ ] Opcional: assinar requests com token próprio (CTM_API_KEY) e validar no Make

Fotos e armazenamento
- [x] Enviar fotos como data URL (base64) no MVP
- [ ] Integrar storage (S3/Cloudinary) e enviar URLs públicas em vez de base64
- [ ] Limitar tamanho/resolução das fotos no cliente (compressão antes do upload)
- [ ] Mostrar contadores/validação de múltiplas fotos (ex.: 12 fotos 360º)

Frontend (UI/UX)
- [x] Adicionar aba “Regras/Observações” com checkboxes e textarea
- [ ] Melhorar acessibilidade (labels, aria-*, foco, contraste)
- [ ] Responsividade móvel (testes em diferentes tamanhos, inputs touch‑friendly)
- [ ] Feedback de carregamento no botão Enviar (spinner/disabled)

Backend (API)
- [x] Rota /api/relatorios com normalização e envio ao Make
- [ ] Sanitização adicional do payload (whitelist de campos)
- [ ] Limites de tamanho do body (fotos base64) e mensagens claras de erro

Deploy (Heroku)
- [x] Scripts de build/start (Next)
- [ ] Configurar MAKE_WEBHOOK_URL em Config Vars
- [ ] (Opcional) Configurar CTM_API_KEY em Config Vars
- [ ] Definir Node 18+ e stack recomendada

Qualidade/Engenharia
- [ ] Adicionar testes básicos de mapeamento do builder (unit)
- [ ] E2E feliz: preencher, anexar 2 fotos, enviar e verificar resposta 200
- [ ] Configurar lint/format (ESLint/Prettier) conforme padrão do projeto
- [ ] CI simples (build + type‑check) no provedor escolhido

Documentação
- [x] README com setup, envs e fluxo de envio
- [ ] Adicionar guia de troubleshooting (Make/Heroku)
- [ ] Checklist de publicação (pré‑release)
