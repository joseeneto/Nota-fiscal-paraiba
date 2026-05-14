# Story 3-1: Parsing e Leitura do PDF

**Objetivo:**
Ler o conteúdo físico do arquivo PDF que chegou no endpoint (texto, imagens ou tabelas binárias) para que os dados fiquem "palpáveis" para o prompt do Gemini analisar.

**Tarefas a serem executadas:**
1. Criar um módulo/serviço chamado `services/pdf_service.py` isolando a lógica.
2. Implementar função utilizando bibliotecas como `PyMuPDF` (`fitz`), `pdfplumber` ou `pdfminer` (dependendo da sua escolha na Story 1-0) para raspar a camada de texto do documento de capa a contracapa.
3. Consertar a extração concatenando as páginas. Se o modelo escolhido do Gemini suportar anexos PDF nativamente, utilizar a SDK do Gemini (`client.files.upload` ou similar via File API) para passar as referências diretamente economizando processamento de caracteres.

**Critérios de Aceite:**
- A função ou módulo deve receber como parâmetro o arquivo binário/UploadFile e retornar com sucesso uma "String completa" do conteúdo da NF OU um arquivo indexado pelo Gemini com a URL pronta para extração.
