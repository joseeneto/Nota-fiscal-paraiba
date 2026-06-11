# 📄 Sistema Financeiro - Extração de Notas Fiscais com IA

Sistema administrativo-financeiro desenvolvido como projeto acadêmico para automação de lançamentos contábeis a partir de Notas Fiscais em PDF, utilizando **Inteligência Artificial (Google Gemini)** para extração de dados e um assistente **RAG (Retrieval-Augmented Generation)** para consultas inteligentes ao banco de dados.

## 🚀 Funcionalidades

- **Extração Inteligente de NF**: Upload de PDF de Nota Fiscal e extração automática de dados (fornecedor, faturado, valores, parcelas, classificação de despesa) via Google Gemini.
- **Verificação de Duplicidade**: Antes de confirmar o lançamento, o sistema verifica se já existe um movimento com os mesmos dados no banco.
- **Painel de Notas**: Visualização de todas as notas lançadas com filtros, totais (A Pagar / A Receber) e status de parcelas.
- **Assistente RAG**: Perguntas em linguagem natural sobre os dados financeiros, com dois modos:
  - **RAG Simples**: Busca direta por palavras-chave no banco.
  - **RAG Embeddings**: Busca semântica vetorial com cache de embeddings.

## 🛠️ Tecnologias

| Camada    | Tecnologia                                          |
|-----------|-----------------------------------------------------|
| Frontend  | React + TypeScript + Vite + TailwindCSS             |
| Backend   | Python + FastAPI + SQLAlchemy                       |
| IA        | Google Gemini (gemini-2.5-flash)                    |
| Banco     | SQLite (financeiro.db)                              |
| Deploy    | Docker + Docker Compose + Nginx                     |

## 📦 Estrutura do Projeto

```
paraiba/
├── docker-compose.yml          # Orquestração dos containers
├── .env                        # Variáveis de ambiente (não commitado)
├── sistema/
│   ├── backend/
│   │   ├── Dockerfile
│   │   ├── main.py             # Ponto de entrada FastAPI
│   │   ├── database.py         # Configuração SQLAlchemy
│   │   ├── models.py           # Modelos ORM
│   │   ├── schemas.py          # Schemas Pydantic
│   │   ├── requirements.txt
│   │   ├── financeiro.db       # Banco de dados SQLite
│   │   ├── routers/
│   │   │   ├── finance_router.py
│   │   │   └── rag_router.py
│   │   └── services/
│   │       ├── gemini_service.py
│   │       └── rag_service.py
│   └── frontend/
│       ├── Dockerfile
│       ├── nginx.conf          # Configuração do Nginx (proxy reverso)
│       ├── package.json
│       └── src/
│           ├── App.tsx
│           └── pages/
│               ├── NfExtraction.tsx
│               ├── NotasList.tsx
│               └── RagSearch.tsx
└── stories/                    # User stories do projeto
```

## 🐳 Como Executar com Docker

### Pré-requisitos
- [Docker](https://www.docker.com/products/docker-desktop/) instalado
- Chave de API do [Google Gemini](https://aistudio.google.com/apikey)

### Passos

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/joseeneto/Nota-fiscal-paraiba.git
   cd Nota-fiscal-paraiba
   ```

2. **Configure a chave de API:**
   Crie um arquivo `.env` na raiz do projeto:
   ```bash
   GEMINI_API_KEY=sua_chave_gemini_aqui
   ```

3. **Inicie os containers:**
   ```bash
   docker compose up --build
   ```

4. **Acesse o sistema:**
   - **Frontend**: http://localhost:5173
   - **API Backend**: http://localhost:8000
   - **Documentação da API**: http://localhost:8000/docs

## 💻 Como Executar Localmente (Desenvolvimento)

### Backend
```bash
cd sistema/backend
python -m venv venv
.\venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd sistema/frontend
npm install
npm run dev
```

## 👥 Equipe

Projeto acadêmico desenvolvido para a disciplina de Projeto Administrativo-Financeiro.

## 📝 Licença

Este projeto é de uso acadêmico.
