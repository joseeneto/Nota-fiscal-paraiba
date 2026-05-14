# Story 3-0: Endpoint de File Upload no Backend

**Objetivo:**
Desenvolver a porta de entrada (API) onde o arquivo PDF será recepcionado do Frontend para processamento pela IA.

**Tarefas a serem executadas:**
1. Em um arquivo do roteador (`routers/finance_router.py` ou `main.py`), criar um endpoint POST: `POST /api/financeiro/extrair-nf`.
2. Habilitar o FastAPI para suportar multipart form-data importando o `UploadFile` e o `File`.
3. Implementar verificações básicas de segurança e tipagem (verificar se o arquivo que chegou é realmente `.pdf`).
4. Salvar temporariamente o PDF em um diretório temporário (`/tmp`) ou passá-lo diretamente como um buffer em memória (Bytes) para a próxima etapa.

**Critérios de Aceite:**
- O endpoint deve estar visível e documentável na documentação Swagger (`/docs`) do FastAPI.
- Deve aceitar um arquivo PDF com o campo FormData e retornar um HTTP 200 (Mockado temporário) ou mensagem de falha para extensões inválidas (ex: `.jpg`, `.doc`).
