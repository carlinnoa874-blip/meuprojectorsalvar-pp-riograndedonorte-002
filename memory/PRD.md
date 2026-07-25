# PRD — Portal Concurso Rio Grande do Norte (Instituto Avalia)

## Problem statement (original)
Clone e configure o projeto do GitHub `meuprojectorsalvar-pp-riograndedonorte-001` no sandbox Emergent (/app), preservando .env, com backend FastAPI + admin_routes, frontend React CRA, MongoDB, e admin de teste `farpa/Ads102030` na collection `admins`.

## Stack
- Backend: FastAPI (Python) — `/app/backend/server.py` + `admin_routes.py` + `pix_generator.py`
- Frontend: React CRA + Craco — `/app/frontend`
- DB: MongoDB local (via `MONGO_URL` do `.env`)
- Rota admin: `/farpapainel`

## What's been done (2026-01-25)
- Clonado repo do GitHub em `/app` preservando `.git`, `.emergent`, `backend/.env`, `frontend/.env`
- Instaladas dependências backend (`requirements.txt` sem `emergentintegrations`) + bcrypt/Pillow/qrcode
- Instaladas dependências frontend via `yarn install`
- Admin `farpa` criado na collection `admins` com bcrypt de `Ads102030`
- Frontend buildado (`yarn build`) — 66kB main.js
- Backend + Frontend rodando via supervisor
- Validado: `GET /api/` → 200; `POST /api/admin/auth/login` retorna JWT

## URLs
- Preview: https://projector-rio-norte.preview.emergentagent.com
- Admin: https://projector-rio-norte.preview.emergentagent.com/farpapainel

## Backlog / Next actions
- Testes E2E do painel admin (login → dashboard → CRUDs)
- Verificar fluxo de inscrição/pagamento PIX
