# Story 1-0: Organização do Backend (Pacotes e API)

**Objetivo:**
Preparar o ambiente Python/FastAPI no backend para suportar a integração com IA (Gemini) e trabalhar com processamento de arquivos PDF.

**Tarefas a serem executadas:**
1. Inicializar o ambiente virtual do Python (caso ainda não exista).
2. Adicionar as dependências necessárias no `requirements.txt`:
   - `fastapi` e `uvicorn` (para o servidor Web).
   - `python-multipart` (para receber os arquivos via upload).
   - `google-generativeai` (SDK oficial do Gemini).
   - Biblioteca de manipulação de PDF (sugere-se `pdfplumber` ou `PyMuPDF`).
   - `python-dotenv` (para gerenciar as chaves criptografadas).
3. Gerar e configurar o arquivo `.env` para incluir a chave de API (ex: `GEMINI_API_KEY=sua_chave`).
4. Criar a estrutura inicial de pastas (`/routers`, `/services`, `/schemas`) dentro do backend.

**Critérios de Aceite:**
- A aplicação FastAPI deve rodar localmente sem erros na porta padrão (8000).
- Os pacotes especificados devem constar nos arquivos de dependência do projeto.
- O Token/Chave de API deve estar isolado no seu `.env` lido pela aplicação e NUNCA exposto no código fonte.
