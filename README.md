# Veridit

**Plataforma de autenticação de provas digitais para advogados.**

Sistema que permite capturar conteúdo na web — páginas, conversas, publicações — e gerar imediatamente uma trilha de integridade criptográfica com hash SHA-256, produzindo registros confiáveis o suficiente para uso como prova jurídica.

---

## O Problema

Provas digitais (prints de conversas, publicações em redes sociais, páginas web) são facilmente contestadas em juízo por serem trivialmente forjáveis. O Veridit resolve isso capturando o conteúdo de forma automatizada em ambiente isolado e aplicando, no momento da captura, um hash SHA-256 sobre o artefato gerado — armazenando o registro em uma trilha de auditoria append-only que não pode ser alterada após a criação.

---

## Arquitetura

O sistema segue uma arquitetura de microsserviços com API Gateway como ponto único de entrada. O frontend nunca acessa os serviços internos diretamente — toda comunicação passa pelo Gateway, que centraliza autenticação JWT e controle de acesso por papéis (RBAC).

```
Frontend (Next.js)  :3001
        │
        ▼
API Gateway (Express)  :3000
  ├── Autenticação JWT + RBAC
  ├── /api/users/*     → Supabase (users)
  ├── /api/captures    → Supabase (auditoria)
  └── /api/capture ──► Serviço de Captura (FastAPI)  :8000
                              │
                       Playwright (Chromium)
                       hashlib SHA-256
                       Supabase (auditoria)
```

| Serviço | Stack | Porta |
|---|---|---|
| Frontend | Next.js 15, React 19, Tailwind CSS v4 | 3001 |
| API Gateway | Node.js, Express, JWT, bcrypt | 3000 |
| Serviço de Captura | Python, FastAPI, Playwright | 8000 |
| Banco de Dados | Supabase (PostgreSQL) | remoto |

---

## Funcionalidades Implementadas

- **Cadastro e login** com bcrypt + JWT (expiração 2h)
- **Nova Captura** — wizard 3 passos: formulário → processamento com feedback em tempo real → resultado com screenshot
- **Hash SHA-256** gerado imediatamente após a captura, antes de qualquer gravação
- **Relatório PDF** com screenshot embutido, marca d'água Veridit e referência à MP 2.200-2/2001
- **Histórico de registros** com busca por título ou URL
- **Detalhe do registro** com hash copiável e geração de PDF
- **Dashboard** com contadores reais e tabela de capturas recentes
- **RBAC** — roles `cliente` e `admin`, rotas admin restritas no gateway

---

## Como Rodar

Veja o guia completo em **[docs/como-rodar.md](docs/como-rodar.md)**.

**Resumo — abra 3 terminais:**

```bash
# Terminal 1 — Serviço de Captura
cd Verity7/servico-captura
venv\Scripts\activate          # Windows
pip install -r requirements.txt
playwright install chromium    # apenas na primeira vez
python main.py

# Terminal 2 — API Gateway
cd Verity7/api-gateway
npm install                    # apenas na primeira vez
npm run dev

# Terminal 3 — Frontend
cd Verity7/frontend
npm install                    # apenas na primeira vez
npm run dev
```

Acesse **http://localhost:3001**

---

## Documentação

| Documento | Descrição |
|---|---|
| [docs/como-rodar.md](docs/como-rodar.md) | Guia completo de execução local com troubleshooting |
| [docs/requisitos-sprint.md](docs/requisitos-sprint.md) | Requisitos listados do sistema |
| [docs/FUNCIONALIDADES.md](FUNCIONALIDADES.md) | Lista completa de todas as funcionalidades implementadas e endpoints |

---

## Contexto Acadêmico

Desenvolvido para a disciplina **Engenharia de Software I**, ministrada pelo Prof. Dr. Eduardo Almeida, no curso de Sistemas de Informação da **Universidade Federal da Bahia (UFBA)**.

Esta entrega corresponde ao **Trabalho III** — implementação de 30% dos requisitos definidos no documento de arquitetura, com demonstração do sistema em funcionamento, aplicação de princípios SOLID e documentação de desvios arquiteturais via ADRs.

| Documento | Caminho |
|---|---|
| Requisitos implementados nesta sprint | `docs/requisitos-sprint.md` |
