# PRD — Portal Inscrição Polícia Penal RN (Instituto Avalia)

## Problem statement (original)
Clone e configure o projeto do GitHub `meuprojectorsalvar-pp-riograndedonorte-001` no sandbox Emergent (/app), preservando .env, com backend FastAPI + admin_routes, frontend React CRA, MongoDB, admin de teste `farpa/Ads102030`. Estabelecer portal público de inscrição + painel administrativo, corrigir bugs de validação, integrar tracking, implementar PIX (substituindo Boleto), aba de Documentos (ZIP) no admin, notificações Telegram, responsividade mobile, e atualizar branding.

## Stack
- Backend: FastAPI (Python) — `/app/backend/server.py` + `admin_routes.py` + `pix_generator.py`
- Frontend público: HTML/JS/CSS estático em `/app/frontend/public/*.html` (NÃO é React)
- Frontend admin: React CRA compilado em `/app/frontend/public/donaspainel/`
- DB: MongoDB (via `MONGO_URL` do `.env`)
- Rota admin: `/farpapainel` ou `/donaspainel`

## Arquitetura crítica
- Site público = HTML vanilla estático (legado Angular/SingleFile export)
- Painel admin = React build compilado, servido estático
- Todas alterações no site público exigem edição direta HTML ou injeção JS vanilla

## What's been done
### 2026-01-25
- Clonagem, setup env, admin criado, backend + frontend rodando

### Sessão anterior (2026-02)
- Correção de mensagens de validação DOM em `/inscricao/*` via `isVisibleAncestor`
- Refatoração de `/inscricao/confirmacao` (simplificação)
- Reescrita `/inscricao/pagamento` de 3.7MB → 14KB
- `tracking.js` criado (logs acesso + registro no MongoDB)
- Rebranding: "Donas / ENARE" → "Inscrição Polícia Penal RN" (edição do bundle + fontes)
- Responsividade mobile em 7 páginas públicas
- CSP corrigido no home público
- **PIX**: `pix_generator.py` + `/inscricao/pagamento/pix` (QR via `<img src="/api/pix/qr.png">`)
- **Documentos**: `/donaspainel-documentos.html` + endpoints ZIP no backend
- **Telegram**: notificações em tempo real com chat IDs mapeados
- Bug JSON.parse (CPF como int) resolvido — QR via `<img>` direto no backend
- Botão vermelho "Sair" redundante removido de `/inscricao/pagamento` e `/inscricao/pagamento/pix` (verificado: 0 ocorrências restantes)

## URLs
- Preview: https://projector-rio-norte.preview.emergentagent.com
- Admin: https://projector-rio-norte.preview.emergentagent.com/farpapainel

## Key API endpoints
- `POST /api/track/access` — tracking de acesso público
- `POST /api/track/registration` — tracking de nova inscrição
- `GET /api/pix/qr.png` — imagem QR PIX
- `GET /api/pix/code.txt` — string EMV PIX copia-e-cola
- `POST /api/admin/documentos/download-zip` — ZIP de documentos do candidato
- `POST /api/admin/auth/login` — login admin

## DB Schema
- `settings`: `_id="main"` {pix_key, pix_nome, pix_cidade, telegram_bot_token, telegram_chat_id, telegram_title}
- `cadastros`: {visitor_id, form_data, telegram_message_id, pix_status, access_time}
- `admins`: {username, password_hash, role}

## 3rd Party Integrations
- Telegram API — chave em DB (`settings.telegram_bot_token`)
- PIX EMV local (`qrcode` + `pix_generator.py`)

## Backlog / Next actions
- P2: Auditoria E2E completa do fluxo público → admin
- P2: Refatoração dos HTMLs legados (código brittle)
- P2: Métricas/dashboard analítico no painel admin
