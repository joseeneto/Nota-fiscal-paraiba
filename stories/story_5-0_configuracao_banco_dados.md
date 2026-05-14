# Story 5-0: Configuração de Infraestrutura de Dados e Docker

**Objetivo:**
Estabelecer a base de dados relacional e a infraestrutura de containers necessária para suportar a persistência e a orquestração do sistema completo (Backend, Frontend e Banco de Dados).

**Tarefas a serem executadas:**
1. Adicionar dependências de banco de dados ao `requirements.txt` (`sqlalchemy`, `psycopg2-binary`).
2. Criar o arquivo `database.py` no backend para gerenciar a conexão com o PostgreSQL via SQLAlchemy.
3. Criar o `docker-compose.yml` na raiz do projeto definindo os serviços: `db` (postgres:15), `backend` e `frontend`.
4. Criar os `Dockerfile` específicos para o Backend (FastAPI) e Frontend (Vite/React).
5. Configurar variáveis de ambiente (`.env`) para que o Backend saiba se conectar ao banco de dados tanto localmente quanto dentro do Docker.

**Critérios de Aceite:**
- O comando `docker-compose up` deve subir os 3 serviços com sucesso.
- O backend deve conseguir se conectar ao PostgreSQL e realizar o check de conectividade no startup.
