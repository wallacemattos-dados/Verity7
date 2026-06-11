# Documentação da API - Veridit

**Base URL (Ambiente Local):** http://localhost:3000
**Ponto de Entrada:** API Gateway (Node.js)

Todas as requisições do frontend devem ser apontadas para a porta 3000. O Gateway encarrega-se de fazer o roteamento interno para os microsserviços adequados.

---

## 1. Autenticação (Login)
Responsável por autenticar o utilizador e devolver o token de acesso necessário para as rotas protegidas.

- **Método:** POST
- **Rota:** /api/users/login
- **Autenticação:** Nenhuma

### Body (JSON)
{
  "email": "usuario@email.com",
  "password": "senha_segura_123"
}

### Respostas Esperadas
- **200 OK**: Retorna o Token JWT que deve ser guardado no frontend.
- **401 Unauthorized**: E-mail ou senha incorretos.

---

## 2. Solicitar Captura de Tela
Responsável por receber a URL, processar a captura de ecrã em ambiente isolado, gerar o Hash criptográfico (SHA-256) e guardar os metadados de auditoria.

- **Método:** POST
- **Rota:** /api/capture
- **Autenticação:** Obrigatória (Bearer Token)

### Headers Obrigatórios
- **Authorization:** Bearer <COLOQUE_O_TOKEN_JWT_AQUI>
- **Content-Type:** application/json

### Body (JSON)
{
  "url": "[https://www.google.com](https://www.google.com)",
  "titulo": "Print de Sucesso",
  "usuario_id": "uuid-do-usuario-aqui"
}

### Respostas Esperadas
- **200 OK**: Captura efetuada e registada com sucesso.
- **401 Unauthorized**: Token JWT ausente ou inválido.
- **404 Not Found**: Rota não encontrada no Gateway.
- **500 Internal Server Error**: Falha no motor de renderização ou erro de gravação.