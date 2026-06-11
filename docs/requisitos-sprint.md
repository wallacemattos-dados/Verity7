# Mapeamento de Requisitos — Sprint Atual (30%)

**Disciplina:** Engenharia de Software I — UFBA  
**Entrega:** Trabalho III  
**Data:** Junho de 2026

---

## Resumo Executivo

| | Quantidade | % do total |
|---|---|---|
| Total de requisitos | 16 | 100% |
| ✅ Implementado | 5 | 31% |
| ⚠️ Parcialmente implementado | 3 | 19% |
| ❌ Não implementado | 8 | 50% |

**Conclusão: a meta de 30% está atingida.** Os 5 requisitos completamente implementados representam 31% do total, e mais 3 foram parcialmente entregues.

---

## Mapeamento Detalhado

### REQ 01 — Cadastrar Usuário · Prioridade Alta

> O sistema deve permitir o cadastro de usuários com base nos campos definidos no Apêndice A.

**Status: ⚠️ Parcialmente implementado**

| Campo do Apêndice A | Implementado |
|---|---|
| Email | ✅ |
| Senha | ✅ |
| Nome completo | ❌ |
| CPF | ❌ |
| Número da OAB (advogado) | ❌ |
| Diferenciação Advogado / Usuário comum | ❌ (apenas role genérico `cliente`) |

O fluxo de cadastro funciona end-to-end (formulário → bcrypt → Supabase → redirect com mensagem de sucesso), mas os campos obrigatórios do Apêndice A não foram incluídos no escopo desta sprint.

---

### REQ 02 — Recuperar Senha · Prioridade Média

> O sistema deve permitir que o usuário possa recuperar a senha de acesso.

**Status: ❌ Não implementado**

Não há fluxo de recuperação de senha na aplicação. Sem tela de "esqueci minha senha", sem envio de email de redefinição.

---

### REQ 03 — Logar no Sistema · Prioridade Alta

> O sistema deve permitir que o usuário efetue login.

**Status: ✅ Implementado**

- Formulário de login com email e senha
- Toggle mostrar/ocultar senha
- Autenticação via JWT com expiração de 2h
- Redirecionamento automático para o dashboard após login
- Mensagem de erro inline para credenciais inválidas
- Redirecionamento para `/login` em rotas protegidas sem sessão ativa

---

### REQ 04 — Sair do Sistema · Prioridade Alta

> O sistema deve permitir que o usuário efetue logout.

**Status: ✅ Implementado**

- Botão de logout na sidebar disponível em todas as telas autenticadas
- Limpa o token do `localStorage`
- Redireciona para a tela de login

---

### REQ 05 — Comprar Créditos · Prioridade Alta

> O sistema deve permitir a compra de créditos em pacotes (básico, médio, premium).

**Status: ❌ Não implementado**

Nenhuma tela, rota ou lógica de créditos foi implementada nesta sprint. Fora do escopo do Trabalho III.

---

### REQ 06 — Efetuar Pagamento de Créditos · Prioridade Alta

> O sistema deve permitir pagamento via Mercado Pago ou Pix (QR Code).

**Status: ❌ Não implementado**

Depende do REQ 05. Nenhuma integração com gateway de pagamento foi realizada.

---

### REQ 07 — Confirmar Pagamento por Email · Prioridade Alta

> O sistema deve informar o usuário por email da compra realizada.

**Status: ❌ Não implementado**

Sem serviço de envio de email configurado na aplicação.

---

### REQ 08 — Iniciar Registro de Conteúdo · Prioridade Alta

> O sistema deve permitir captura de conteúdo (tela de site ou vídeo de navegação) com base nos campos do Apêndice A.

**Status: ✅ Implementado (captura de tela)**

| Campo do Apêndice A | Implementado |
|---|---|
| Endereço do site (URL) | ✅ |
| Título do registro | ✅ |

- Captura de screenshot full-page via Playwright (Chromium headless)
- Hash SHA-256 gerado imediatamente após a captura
- Registro salvo na tabela `auditoria` com `url_alvo`, `titulo`, `hash_img`, `usuario_id`
- Wizard de 3 passos com feedback em tempo real (mensagens de status + barra de progresso)

**Limitação documentada:** captura de vídeo de navegação não foi implementada nesta sprint. Apenas screenshot estático.

---

### REQ 09 — Concluir Gravação de Conteúdo · Prioridade Alta

> O sistema deve permitir a conclusão da gravação de conteúdo (vídeo).

**Status: ❌ Não implementado**

Depende da gravação de vídeo (REQ 08 parcial). Fora do escopo desta sprint.

---

### REQ 10 — Confirmar Gravação de Conteúdo por Email · Prioridade Alta

> O sistema deve informar o usuário por email da conclusão da gravação.

**Status: ❌ Não implementado**

Sem serviço de email. Fora do escopo desta sprint.

---

### REQ 11a — Concluir Captura de Tela · Prioridade Alta

> O sistema deve permitir a conclusão da captura de tela do conteúdo.

**Status: ✅ Implementado**

- Passo 3 do wizard exibe o resultado completo da captura
- Preview scrollável do screenshot capturado
- Metadados exibidos: ID do registro, status, URL, tamanho em KB
- Hash SHA-256 em destaque com botão de copiar
- Opções: Nova Captura, Baixar PDF, Ir ao Dashboard

---

### REQ 11b — Confirmar Captura de Tela por Email · Prioridade Alta

> O sistema deve informar o usuário por email da conclusão da captura.

**Status: ❌ Não implementado**

Sem serviço de email. Fora do escopo desta sprint.

---

### REQ 12 — Listar Registros Realizados · Prioridade Alta

> O sistema deve listar os registros realizados pelo usuário com base nos campos do Apêndice A.

**Status: ⚠️ Parcialmente implementado**

| Campo do Apêndice A | Implementado |
|---|---|
| Título | ✅ |
| Data/hora início | ❌ (coluna `created_at` ausente no banco) |
| Data/hora fim | ❌ |
| Detalhes (link para detalhe) | ✅ |
| Status | ❌ não exibido na listagem |

- Tela `/dashboard/registros` com busca em tempo real por título ou URL
- Tabela clicável com navegação para detalhe de cada registro
- Estado vazio com CTA para nova captura
- Dados carregados via `GET /api/captures` (autenticado, escopado por usuário)

---

### REQ 13 — Visualizar Detalhes dos Registros · Prioridade Alta

> O sistema deve disponibilizar os dados do registro selecionado com base nos campos do Apêndice A.

**Status: ⚠️ Parcialmente implementado**

| Campo do Apêndice A | Implementado |
|---|---|
| ID gerado pelo sistema | ✅ |
| Título | ✅ |
| Data/hora início | ❌ (ausente no banco) |
| Data/hora fim | ❌ |
| Tipos de dados registrados | ❌ |
| Número de imagens e vídeos | ❌ |
| Usuário responsável pelo registro | ❌ não exibido na tela |

- Tela `/dashboard/registros/:id` carrega o registro por ID
- Exibe: ID, título, URL capturada, hash SHA-256 com botão copiar
- Segurança: query filtra por `usuario_id` — usuário não acessa registros de outros

---

### REQ 14 — Gerar Relatório do Registro · Prioridade Alta

> O sistema deve gerar um relatório com base nos campos do Apêndice A.

**Status: ✅ Implementado (com limitações)**

| Campo do Apêndice A | Implementado |
|---|---|
| Título | ✅ |
| ID gerado pelo sistema | ✅ |
| Usuário | ❌ não incluído no PDF |
| CPF | ❌ não coletado no cadastro |
| Data/hora início | ✅ (timestamp de geração do PDF, não da captura) |
| Data/hora fim | ❌ |
| Duração | ❌ |
| Imagens capturadas | ✅ (screenshot embutido em base64 no PDF pós-captura) |
| URL do site navegado | ✅ |

- PDF gerado no cliente via `window.open()` + `window.print()`
- Marca d'água "VERIDIT" em diagonal
- Referência à MP 2.200-2/2001 no rodapé
- Dois contextos: pós-captura (com screenshot) e a partir do histórico (sem screenshot)

---

### REQ 15 — Gerar Arquivo ZIP do Registro · Prioridade Alta

> O sistema deve gerar um arquivo ZIP para download com os arquivos capturados.

**Status: ❌ Não implementado**

Sem geração de ZIP. Fora do escopo desta sprint.

---

## Visão Consolidada

```
REQ 01  Cadastrar Usuário              ⚠️  Parcial   — campos do Apêndice A incompletos
REQ 02  Recuperar Senha                ❌  Ausente
REQ 03  Logar no Sistema               ✅  Completo
REQ 04  Sair do Sistema                ✅  Completo
REQ 05  Comprar Créditos               ❌  Ausente
REQ 06  Efetuar Pagamento              ❌  Ausente
REQ 07  Confirmar Pagamento (email)    ❌  Ausente
REQ 08  Iniciar Registro               ✅  Completo  — apenas screenshot (sem vídeo)
REQ 09  Concluir Gravação (vídeo)      ❌  Ausente
REQ 10  Confirmar Gravação (email)     ❌  Ausente
REQ 11a Concluir Captura de Tela       ✅  Completo
REQ 11b Confirmar Captura (email)      ❌  Ausente
REQ 12  Listar Registros               ⚠️  Parcial   — sem timestamps
REQ 13  Visualizar Detalhes            ⚠️  Parcial   — campos reduzidos
REQ 14  Gerar Relatório                ✅  Completo  — sem CPF/usuário/duração
REQ 15  Gerar Arquivo ZIP              ❌  Ausente
```

---

## O que Falta para a Próxima Sprint (Candidatos)

**Alta prioridade — completam requisitos já iniciados:**
- Adicionar `created_at` à tabela `auditoria` (desbloqueia timestamps em REQ 12, 13, 14)
- Adicionar campos Nome completo e CPF ao cadastro (REQ 01)
- Confirmar captura por email após conclusão (REQ 11b)

**Média prioridade — novos requisitos:**
- REQ 02 — Recuperar senha (fluxo de redefinição via email)
- REQ 15 — Geração de ZIP com os artefatos do registro

**Fora de escopo imediato:**
- REQ 05/06/07 — Sistema de créditos e pagamentos (Mercado Pago / Pix)
- REQ 09/10 — Gravação de vídeo de navegação
