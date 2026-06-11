# Como Rodar o Veridit

Guia completo para subir os três serviços localmente do zero.

---

## Pré-requisitos

| Ferramenta | Versão mínima | Verificar |
|---|---|---|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Python | 3.10+ | `python --version` |
| pip | qualquer | `pip --version` |
| Git | qualquer | `git --version` |

---

## Estrutura de Portas

```
:3001  →  Frontend  (Next.js)
:3000  →  API Gateway  (Express)
:8000  →  Serviço de Captura  (FastAPI)
```

O frontend só fala com o Gateway (:3000).  
O Gateway roteia capturas para o Serviço de Captura (:8000).

---

## Variáveis de Ambiente

Os arquivos `.env` já estão configurados no repositório. **Não é necessário criar nenhum arquivo de ambiente** — as credenciais do Supabase e o JWT Secret já estão presentes.

| Arquivo | Caminho |
|---|---|
| Gateway | `api-gateway/.env` |
| Serviço de Captura | `servico-captura/.env` |
| Frontend | `frontend/.env.local` |

---

## 1. Serviço de Captura (Python/FastAPI)

Abra um terminal na raiz do projeto e execute:

```bash
cd Verity7/servico-captura
```

**Primeira vez — criar e ativar o ambiente virtual:**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

**Instalar dependências:**

```bash
pip install -r requirements.txt
```

**Instalar o navegador Playwright (apenas na primeira vez):**

```bash
playwright install chromium
```

**Rodar o serviço:**

```bash
python main.py
```

**Saída esperada:**
```
✅ .env carregado de: ...\servico-captura\.env
INFO:     Started server process
INFO:     Uvicorn running on http://127.0.0.1:8000
```

> O serviço de captura **deve ser o primeiro a subir**, pois o Gateway verifica a variável `CAPTURE_SERVICE_URL` na inicialização.

---

## 2. API Gateway (Node.js/Express)

Abra um **novo terminal** e execute:

```bash
cd Verity7/api-gateway
```

**Instalar dependências (apenas na primeira vez):**

```bash
npm install
```

**Rodar o gateway:**

```bash
npm run dev
```

**Saída esperada:**
```
Servidor iniciado em http://localhost:3000
```

**Verificar se está de pé:**
```bash
curl http://localhost:3000/api/health
# {"status":"success","message":"API Gateway rodando!"}
```

---

## 3. Frontend (Next.js)

Abra um **terceiro terminal** e execute:

```bash
cd Verity7/frontend
```

**Instalar dependências (apenas na primeira vez):**

```bash
npm install
```

**Rodar o frontend:**

```bash
npm run dev
```

**Saída esperada:**
```
▲ Next.js 15.x.x
- Local: http://localhost:3001
```

Acesse **http://localhost:3001** no navegador.

---

## Ordem de Inicialização

```
1º  servico-captura   →  python main.py
2º  api-gateway       →  npm run dev
3º  frontend          →  npm run dev
```

Os três terminais devem ficar abertos simultaneamente.

---

## Fluxo de Teste Rápido

1. Acesse `http://localhost:3001`
2. Clique em **Criar conta** e cadastre um usuário
3. Faça login com as credenciais criadas
4. No Dashboard, clique em **Nova Captura**
5. Informe uma URL pública (ex: `https://example.com`) e um título
6. Clique em **Iniciar Captura** e aguarde (~15–30 segundos)
7. Visualize o screenshot, copie o hash SHA-256 ou baixe o PDF
8. Acesse **Registros** no menu lateral para ver o histórico

---

## Problemas Comuns

**`ModuleNotFoundError: No module named 'dotenv'`**
```bash
pip install python-dotenv
```

**`CAPTURE_SERVICE_URL não configurado`**
- Verifique se o arquivo `api-gateway/.env` existe e contém `CAPTURE_SERVICE_URL=http://localhost:8000`

**Frontend não acessa a API (erro de rede)**
- Confirme que o Gateway está rodando na porta 3000
- Verifique `frontend/.env.local`: deve conter `NEXT_PUBLIC_API_URL=http://localhost:3000`

**Porta 3000 já em uso**
- Outro processo está ocupando a porta. Encerre-o ou altere `PORT` no `api-gateway/.env`

**Playwright: erro ao abrir navegador**
```bash
playwright install chromium
# se persistir:
playwright install --with-deps chromium
```

**`venv\Scripts\activate` não reconhecido (Windows)**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
