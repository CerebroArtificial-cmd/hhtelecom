Relatório de Buscas (Next.js)

Aplicativo web para coleta de informações em campo com checklist baseado no fluxo da CTM (ctmsites.com.br). O app permite preencher dados estruturados, anexar fotos (com coordenadas), salvar rascunhos no navegador e enviar os relatórios para uma planilha/automação via Make.com.

Principais recursos
- Formulário em abas: Informações Iniciais, Documentação, Infraestrutura, Fotos, Croqui e Regras/Observações.
- Persistência local automática (localStorage) enquanto o usuário preenche.
- Envio do relatório via API Next para um webhook do Make.com (normalizado pelo builder CTM).
- Upload de fotos no navegador com mini‑prévia e captura de coordenadas (geolocalização do dispositivo).
- Normalização do payload (SIM/NAO, moedas, CEP/telefone, etc.) antes de enviar ao Make.

Arquitetura
- Next.js App Router com TypeScript e Tailwind.
- UI baseada em shadcn/ui + Radix (componentes em src/components/ui).
- Tipos/utilitários de normalização em src/lib/send-report.ts:1 (builder CTM).
- Rota de envio em src/app/api/relatorios/route.ts:1.

Pré‑requisitos
- Node 18+ (recomendado LTS atual).
- npm ou pnpm/yarn.

Instalação
- Clone o repositório e instale dependências:
  - 
pm install

Execução (desenvolvimento)
- 
pm run dev
- Acesse: http://localhost:3000

Build e produção
- 
pm run build
- 
pm start

Variáveis de ambiente
Crie um arquivo .env.local (ou defina como variáveis no ambiente/Heroku):
- MAKE_WEBHOOK_URL (recomendado) — URL do webhook do Make.com que receberá o payload.
- CTM_API_KEY (opcional) — chave que será enviada no header X-CTM-Key para auditoria/segurança downstream.

Observação: o código também aceita NEXT_PUBLIC_MAKE_WEBHOOK_URL e NEXT_PUBLIC_MAKE_WEBHOOK. Caso nenhuma variável esteja definida, há um fallback de webhook configurado somente para facilitar testes locais.

Fluxo de envio
1) O usuário preenche o formulário por abas e anexa fotos.
2) Ao clicar em Enviar, o app converte os arquivos de foto em data URLs (base64) e os inclui no corpo do POST para a rota src/app/api/relatorios/route.ts:1.
3) A rota API mapeia os campos do formulário para as seções do builder em src/lib/send-report.ts:1 e gera o payload no padrão CTM (inclui normalizações de SIM/NAO, moeda, CEP/telefone, etc.).
4) O servidor envia o payload normalizado ao webhook do Make.com com etch.

Tamanho de fotos e performance
- As fotos são enviadas como data URLs (base64). Isso é simples, porém aumenta o tamanho do payload e pode afetar performance em redes lentas.
- Alternativa recomendada para produção: enviar as fotos para um storage (ex.: S3/Cloudinary) e repassar ao Make apenas as URLs públicas. O ponto de troca fica concentrado na rota src/app/api/relatorios/route.ts:1.

Componentes principais
- src/components/ui/ReportForm.tsx:1 — formulário principal (abas, salvar/exportar/enviar).
- src/components/ui/PhotoChecklist.tsx:1 — checklist de fotos com prévias e captura de coordenadas.
- src/components/ui/BasicInfo.tsx:1 — informações iniciais (siteType, operador, CAND/CORD, endereço, etc.).
- src/components/ui/Documentation.tsx:1 — documentação (IPTU/ITR, escritura, matrícula, etc.).
- src/components/ui/Infrastructure.tsx:1 — infraestrutura (terreno plano, árvores, construção, energia, extensão de rede).
- src/components/ui/SketchSection.tsx:1 — croqui/observações de terreno.
- src/components/ui/RulesSection.tsx:1 — regras/observações (distâncias mínimas, área limpa, árvore/espécie, observação livre).

Normalização (builder)
- src/lib/send-report.ts:1 contém:
  - Tipos das seções (início, documentação, croqui, fotos, regras).
  - Utilitários de normalização (SIM/NAO, moedas, CEP, telefone).
  - Função uildRelatorioPayload(...) que recebe objetos parciais do formulário e gera o payload padronizado para o Make.

Integração com o Make.com
- Edite seu webhook no .env (recomendado) ou diretamente em src/app/api/relatorios/route.ts:1.
- O Make pode armazenar os dados em planilha ou distribuir para outros serviços.
- O payload já vem “limpo”/normalizado para facilitar a ingestão.

Implantação no Heroku
- Configure as variáveis em Settings → Config Vars:
  - MAKE_WEBHOOK_URL (recomendado)
  - CTM_API_KEY (opcional)
- Scripts já prontos no package.json:
  - 
pm run build → build
  - 
pm start → inicia Next em modo produção
- Garanta stack com Node 18+.

Rotas e paths
- App Router (Next 13+): a rota de envio está em src/app/api/relatorios/route.ts:1.
- Aliases TypeScript já configurados:
  - @/* aponta para src/* (veja 	sconfig.json:1).

Como adaptar campos
- Para incluir/ajustar campos do checklist:
  - Atualize os componentes em src/components/ui e mapeie os novos valores em src/app/api/relatorios/route.ts:1 para o builder.
  - Se necessário, expanda os tipos/mapeamentos em src/lib/send-report.ts:1.

Toasts e UX
- Feedback de sucesso/erro via sonner.
- O formulário salva rascunho automaticamente no navegador.

Contribuindo
- Ajuste os componentes com o mesmo padrão existente (shadcn/ui c/ Radix + Tailwind).
- Mantenha o foco em alterações mínimas e tipagem coerente (TypeScript).

Licença
- Uso interno do projeto. Adapte conforme a política da sua organização.


## Heroku (Config Vars)
- Heroku ignora arquivos .env em produção. Configure as variáveis no painel (Settings → Config Vars) ou via CLI.
- CLI exemplos:
  - heroku config:set MAKE_WEBHOOK_URL='https://hook.us2.make.com/...' --app <app>
  - heroku config:set CTM_API_KEY='your-key' --app <app>
  - heroku config:set NEXT_TELEMETRY_DISABLED=1 --app <app>

## Ambiente local (.env.local)
- Para desenvolvimento local, copie .env.local.example para .env.local e preencha os valores.
- Mantenha .env e .env.local fora do git (já estão no .gitignore).
- Para rodar localmente: npm run dev (ou defina PORT no .env.local).
