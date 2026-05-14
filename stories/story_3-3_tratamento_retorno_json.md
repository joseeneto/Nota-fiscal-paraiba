# Story 3-3: Tratamento de Retorno (Integração IA e Saída JSON)

**Objetivo:**
Juntar a leitura, o prompt, os schemas e efetuar a chamada final a API do Gemini, formatando tudo para garantir um payload seguro de resposta em JSON para a interface.

**Tarefas a serem executadas:**
1. Unir as etapas do fluxo no roteador ou controlador final: Endpoint (3-0) -> Recebe Upload -> Leitura PDF (3-1) -> Prompt (3-2).
2. Chamar a função base do Google AI `genai.GenerativeModel.generate_content(...)`.
3. Para forçar a IA a responder somente JSON na mesma arquitetura da **Story 2-0**, utilizar bibliotecas modernas como o `Instructor` (para empacotar a saída do Gemini em um Schema Pydantic), ou usar a flag nativa do Gemini 1.5 Pro/Flash definindo a `response_mime_type="application/json"` e `response_schema`.
4. Parsear o retorno, validar se preencheu todos os campos (Fornecedor, Dados da Nota, Faturado e a Categoria).
5. O Endpoint FastAPI devolve um payload estritamente com Status 200 contendo o JSON inteiro para o sistema Frontend apresentar.

**Critérios de Aceite:**
- Realizar um teste (ex: Postman/Insomnia) enviando uma Nota Fiscal qualquer e comprovar que todo o texto livre da NF virou um dicionário estruturado e categorizado perfeitamente.
