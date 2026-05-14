# Story 2-0: Criação do Pydantic Schema de Saída (JSON)

**Objetivo:**
Criar a base sólida de dados para que a Inteligência Artificial e a aplicação FastAPI compreendam qual o "molde" exato (dicionário JSON) que uma Nota Fiscal deve resultar de acordo com os requisitos estabelecidos na atividade.

**Tarefas a serem executadas:**
1. Criar um arquivo como `schemas.py` ou `financeiro_schemas.py`.
2. Modelar o Pydantic `BaseModel` seguindo a hierarquia exata solicitada nas regras de negócios:
   - Entidade raiz da nota englobando sub-classes ou campos estritos:
   - Model `Fornecedor`: "Razão Social", "Fantasia", "CNPJ".
   - Model `Faturado`: "Nome Completo", "CPF".
   - Campos diretos da NF: "Número da Nota Fiscal", "Data de Emissão", "Data de Vencimento" e "ValorTotal".
   - Campo "Quantidade de Parcelas" (`int`).
   - Campo "Descrição dos produtos" (`List[str]`).
   - Campo "Classificação da DESPESA" (`str` ou `Enum` com as categorias padrão já mapeadas).

**Critérios de Aceite:**
- O model deverá possuir obrigatoriedade nos campos descritos.
- Deve apoiar-se plenamente na estrutura Pydantic (`BaseModel`) auxiliando em validações e garantindo que o Gemini será forçado a preencher toda a hierarquia na resposta para o Frontend.
