# Veridit — Funcionalidades Implementadas

> Estado atual da aplicação. Tudo listado aqui está integrado e funcionando end-to-end.

---

## Serviços e Portas

| Serviço | Tecnologia | Porta |
|---|---|---|
| Frontend | Next.js 15 + React 19 + Tailwind v4 | `3001` |
| API Gateway | Node.js + Express | `3000` |
| Serviço de Captura | Python + FastAPI + Playwright | `8000` |
| Banco de Dados | Supabase (PostgreSQL) | remoto |

---

## Fluxo Completo da Aplicação

```
Usuário (Browser :3001)
        │
        ▼
   Frontend Next.js
        │  chama apenas  http://localhost:3000
        ▼
   API Gateway (Express)
     ├── /api/users/*   → UserController (Supabase direto)
     ├── /api/captures  → CaptureController (Supabase direto)
     └── /api/capture   → proxy → Serviço de Captura (:8000)
                                        │
                                        ├── Playwright (screenshot)
                                        ├── hashlib SHA-256
                                        └── Supabase (salva em `auditoria`)
```

---

## Funcionalidades por Módulo

### 1. Autenticação

**Cadastro de conta** — `POST /api/users/register`
- Formulário com email, senha e confirmação de senha
- Validação client-side: senhas devem coincidir, mínimo 8 caracteres
- Senha armazenada com hash bcrypt (10 salt rounds)
- Role padrão: `cliente`
- Redireciona para `/login?registered=1` com mensagem de sucesso

**Login** — `POST /api/users/login`
- Formulário com campo de mostrar/ocultar senha
- Retorna JWT com payload `{ id, email, role }`, expiração de 2h
- Token salvo no `localStorage` sob a chave `veridit_token`
- Redireciona automaticamente para `/dashboard` se já autenticado
- Erros de credencial exibidos inline

**Sessão / Guarda de rotas**
- `AuthContext` lê o token do `localStorage` no mount
- Verifica expiração do JWT antes de hidratar o estado
- Todas as rotas do dashboard verificam autenticação via `useEffect`; redirecionam para `/login` se sem token
- `logout()` limpa o localStorage e redireciona para `/login`

---

### 2. Dashboard

**Rota:** `/dashboard`

- Busca todos os registros do usuário autenticado via `GET /api/captures`
- **Card "Total de Registros"** — exibe o total de capturas do usuário
- **Card "Hashes Verificados"** — exibe o mesmo count (garante integridade visual)
- **Card "Conta"** — exibe o role do usuário (`cliente` / `admin`)
- **Tabela de Registros Recentes** — exibe os 5 primeiros registros com título e URL clicáveis; navega para o detalhe ao clicar
- Estado de carregamento com spinner
- Estado vazio com CTA para iniciar a primeira captura

---

### 3. Nova Captura

**Rota:** `/dashboard/nova-captura`

Wizard de 3 passos com barra de progresso visual:

**Passo 1 — Configuração**
- Campos: URL do site (validação de formato `http/https`) e Título do registro
- Aviso informativo sobre tempo de até 30s e uso de hash SHA-256

**Passo 2 — Processando**
- Spinner animado com ícone de câmera pulsante
- Barra de progresso com transição suave
- Mensagens de status ciclando:
  - Conectando ao site…
  - Renderizando a página…
  - Capturando screenshot…
  - Gerando hash SHA-256…
  - Salvando na trilha de auditoria…
  - Aguardando resposta do servidor…
- Chamada real à API em handler de evento (não em `useEffect`) para evitar duplicação do React Strict Mode

**Passo 3 — Concluído**
- Preview scrollável do screenshot capturado (altura máx. 520px)
- Card com metadados: ID do registro, status, título, URL, tamanho em KB
- Hash SHA-256 em destaque com botão **Copiar**
- Botão **Baixar PDF** — gera relatório completo (ver seção PDF)
- Botão **Nova Captura** — reinicia o wizard
- Botão **Ir ao Dashboard**

---

### 4. Lista de Registros

**Rota:** `/dashboard/registros`

- Busca todos os registros do usuário via `GET /api/captures`
- **Busca em tempo real** por título ou URL (filtro client-side)
- Tabela com colunas: Título, URL (fonte mono, truncada), link "Detalhes →"
- Linhas clicáveis com efeito hover; navegam para `/dashboard/registros/:id`
- Contador de registros no rodapé da tabela
- Estado de carregamento com spinner
- Estado vazio diferenciado: sem resultados de busca vs. nenhuma captura ainda
- CTA para nova captura quando lista vazia

---

### 5. Detalhe do Registro

**Rota:** `/dashboard/registros/:id`

- Busca o registro por ID via `GET /api/captures/:id` (escopo: apenas registros do próprio usuário)
- Breadcrumb "← Voltar para Registros"
- Exibe: título, ID do sistema (mono), URL capturada (mono), hash SHA-256 com botão **Copiar**
- Card lateral com badge "Concluído — Integridade verificada"
- Botão **Gerar Relatório PDF** — relatório sem screenshot (ver seção PDF)
- Botão **Nova Captura**

---

### 6. Geração de PDF

Implementado em dois contextos — ambos abrem uma nova janela e disparam `window.print()` automaticamente:

**PDF pós-captura** (`/dashboard/nova-captura` — Passo 3)
- Inclui screenshot completo da captura embutido como base64
- Campos: ID, data/hora, título, URL, tamanho, status, hash SHA-256
- Marca d'água "VERIDIT" repetida em diagonal, opacidade 4%
- Referência à MP 2.200-2/2001 no rodapé

**PDF a partir do histórico** (`/dashboard/registros/:id`)
- Sem screenshot (dado não armazenado na `auditoria`)
- Campos: ID, título, URL, hash SHA-256
- Mesma marca d'água e rodapé legal

---

### 7. Backend — API Gateway

**Autenticação de usuários**

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/users/register` | Cria conta com bcrypt |
| `POST` | `/api/users/login` | Autentica e retorna JWT |
| `GET` | `/api/users/profile` | Retorna dados do usuário autenticado |
| `GET` | `/api/users/admin/dashboard` | Acesso restrito a role `admin` |

**Captura e registros**

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/capture` | Proxy autenticado → Serviço de Captura |
| `GET` | `/api/captures` | Lista registros do usuário autenticado |
| `GET` | `/api/captures/:id` | Detalhe de um registro (escopo por usuário) |
| `GET` | `/api/health` | Health check do gateway |

**Middlewares**
- `authenticateToken` — valida JWT em todas as rotas protegidas
- `requireRole([roles])` — RBAC, verifica role do usuário
- Headers `x-user-id` e `x-user-role` injetados nas requisições proxiadas para o serviço de captura

---

### 8. Backend — Serviço de Captura (Python)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/capture` | Executa captura e salva auditoria |
| `GET` | `/` | Serve página de teste HTML |

**Pipeline de captura:**
1. Valida URL (`http://` ou `https://`)
2. Abre navegador headless com Playwright (Chromium)
3. Captura screenshot full-page em PNG
4. Gera hash SHA-256 com `hashlib`
5. Salva `{ titulo, url_alvo, hash_img, usuario_id }` na tabela `auditoria` do Supabase
6. Retorna `{ id_registro, hash_sha256, tamanho_bytes, status, screenshot_base64 }`

---

## Banco de Dados (Supabase)

### Tabela `users`
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `email` | text | unique |
| `password_hash` | text | bcrypt |
| `role` | text | `cliente` ou `admin` |
| `created_at` | timestamptz | auto |

### Tabela `auditoria`
| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `titulo` | text | |
| `url_alvo` | text | |
| `hash_img` | text | SHA-256 do screenshot |
| `usuario_id` | uuid | FK → users.id |

> `created_at` não existe na tabela `auditoria` — a data não é exibida nas telas de registro.

---

## Segurança

- Senhas hasheadas com **bcrypt** (salt 10) — nunca trafegam em texto plano
- **JWT** com expiração de 2h — payload `{ id, email, role }`
- Todas as rotas de captura requerem token válido
- Consultas ao banco escopadas por `usuario_id` — um usuário nunca vê dados de outro
- Body re-escrito no proxy para evitar conflito entre `express.json()` e `http-proxy-middleware`

---

## Como Rodar

```bash
# 1. Serviço de Captura (Python)
cd Verity7/servico-captura
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
python main.py          # → http://localhost:8000

# 2. API Gateway (Node.js)
cd Verity7/api-gateway
npm install
npm run dev             # → http://localhost:3000

# 3. Frontend (Next.js)
cd Verity7/frontend
npm install
npm run dev             # → http://localhost:3001
```

### Variáveis de Ambiente necessárias

**`api-gateway/.env`**
```
SUPABASE_URL=...
SUPABASE_KEY=...
JWT_SECRET=...
CAPTURE_SERVICE_URL=http://localhost:8000
PORT=3000
```

**`servico-captura/.env`**
```
SUPABASE_URL=...
SUPABASE_KEY=...
```

**`frontend/.env.local`**
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```
