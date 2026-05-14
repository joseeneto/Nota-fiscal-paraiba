# Planejamento: Projeto Administrativo-Financeiro (Etapa 1)

O objetivo central desta primeira etapa é construir um processador de PDF baseado em IA generativa (Gemini) que consiga extrair informações essenciais de Notas Fiscais e categorizar a despesa automaticamente de acordo com as regras de negócios estipuladas.

## Histórias de Usuário (User Stories)

### Story 1: Setup da Integração com Gemini e Processamento de PDF
**Objetivo:** Configurar o ambiente para receber arquivos, processá-los e comunicar com a API do Gemini.
- **Story 1-0: Organização do Backend (Pacotes e API)**
  - Instalar dependências necessárias para ler PDFs em Python (ex: `PyMuPDF` ou `pdfplumber`).
  - Instalar dependências para a SDK do Gemini (`google-generativeai`).
  - Criar chaves (API Keys) de desenvolvimento e adicioná-las ao arquivo `.env` do backend (`GEMINI_API_KEY`).
- **Story 1-1: Organização do Frontend (Rotas e Layout)**
  - Criar um novo roteamento no frontend para a visualização de "Extração de Notas Fiscais".
  - Configurar um componente de página estático inicial.

### Story 2: Estruturação dos Dados (Backend: Schemas Pydantic)
**Objetivo:** Definir os contratos de dados e criar a estrutura JSON rígida que o Gemini deverá preencher.
- **Story 2-0: Criação do Pydantic Schema de Saída (JSON)**
  - Criar os modelos contendo os campos exigidos:
    - **Fornecedor**: Razão Social, Fantasia, CNPJ
    - **Faturado**: Nome Completo, CPF/CNPJ
    - **Detalhes da NF**: Número, Data de Emissão, Data de Vencimento, Valor Total, Quantidade de Parcelas.
    - **Produtos/Itens**: Lista de descrições dos produtos.
    - **Classificação de Despesa**: Campo preenchido via LLM baseando-se nos produtos (ex: "MANUTENÇÃO E OPERAÇÃO", "INSUMOS AGRÍCOLAS").

### Story 3: Lógica de Extração com IA (Backend API)
**Objetivo:** Criar a inteligência que lerá o PDF e conversará com o Gemini.
- **Story 3-0: Endpoint de File Upload**
  - Criar uma nova rota POST no FastAPI `api/financeiro/extrair-nf` suportando envio e recepção de `UploadFile`.
- **Story 3-1: Parsing do PDF para Texto/Imagem**
  - Construir função utilitária que converte o arquivo PDF em texto ou imagens suportadas pelo modelo.
- **Story 3-2: Prompt Engineering do Gemini**
  - Desenvolver o _System Prompt_ com as PRINCIPAIS CATEGORIAS DE DESPESAS e as regras lógicas.
- **Story 3-3: Tratamento de Retorno (JSON)**
  - Chamar a estrutura de IA (via Instructor ou nativa de Structured Outputs do Gemini) para devolver o payload estrito no formato JSON e passar como resposta pela API.

### Story 4: Interface do Usuário (Frontend)
**Objetivo:** Montar uma tela completa, responsiva e bonita para o envio e conferência do PDF.
- **Story 4-0: Interface de Upload (Baseada na FIGURA 1)**
  - Construir um seletor visual e intuitivo (Drag and Drop) que aceite carregar o PDF.
- **Story 4-1: Action Button e Loading State**
  - Implementar um botão "Extrair Dados". Enquanto em andamento, bloquear tela com estado de carregamento e spinner (demonstrando que o LLM está buscando).
- **Story 4-2: Exibição dos Dados Extraídos (Baseada na FIGURA 2)**
  - Recebendo retorno final (excesso de sucesso), desenhar painéis JSON com highlight pra evidenciar de forma elegante todos os campos retornados da nota fiscal.

---

### Dúvidas em Aberto (Para Direcionamento):
1. Você já possui a API KEY gerada do Gemini, ou deseja que eu mostre como gerar uma gratuitamente?
2. Mesmo sendo Etapa 1 focada em PDF/JSON, você gostaria de já criar o ambiente backend (iniciar o projeto FastAPI) e o frontend (Vite/React) do zero dentro desta pasta `paraiba`?

---

# Planejamento: Projeto Administrativo-Financeiro (Etapa 2)

O objetivo desta segunda etapa é a integração com Banco de Dados, realização de análise de existência dos cadastros e persistência final dos movimentos financeiros e suas parcelas, além da conteinerização do projeto via Docker.

## Histórias de Usuário (User Stories - Etapa 2)

### Story 5: Persistência e Análise de Dados
- **Story 5-0: Configuração de Infraestrutura de Dados e Docker**
  - Configurar PostgreSQL, SQLAlchemy e orquestração via Docker Compose.
- **Story 5-1: Modelagem das Entidades Administrativo-Financeiras**
  - Mapear Pessoas, Classificações, Movimentos e Parcelas com as regras de negócio.
- **Story 5-2: Lógica de Verificação de Existência (Análise de Dados)**
  - Endpoint para consultar se Fornecedor/Faturado/Despesa existem no banco.
- **Story 5-3: Fluxo de Persistência e Lançamento Automático**
  - Endpoint para criar cadastros faltantes e registrar o movimento financeiro completo.
- **Story 5-4: Interface de Conferência e Lançamento (Frontend)**
  - UI para mostrar o status de existência e permitir o lançamento final.

### Story 6: Entrega e Deploy
- **Story 6-0: Dockerização Completa e Documentação**
  - Garantir que o ambiente sobe com um único comando e preparar o repositório para entrega.
