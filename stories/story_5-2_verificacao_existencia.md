# Story 5-2: Lógica de Verificação de Existência (Análise de Dados)

**Objetivo:**
Implementar o serviço que consulta o banco de dados para informar se os dados extraídos da NF já constam no cadastro do sistema.

**Tarefas a serem executadas:**
1. Criar um novo endpoint `POST /api/financeiro/verificar` que recebe o objeto JSON da extração (Story 3.3).
2. Implementar queries no Banco de Dados para buscar:
   - Fornecedor por CNPJ.
   - Faturado por CPF.
   - Classificação de Despesa por Descrição (ex: "MANUTENÇÃO E OPERAÇÃO").
3. Retornar um JSON contendo o status de cada entidade (EXISTE + ID ou NÃO EXISTE).

**Critérios de Aceite:**
- O retorno do endpoint deve seguir o exemplo: `FORNECEDOR: NÃO EXISTE`, `FATURADO: EXISTE – ID: 19`, `DESPESA: EXISTE – ID: 22`.
- A busca por CNPJ/CPF deve ignorar formatação (pontos e traços) para evitar falsos negativos.
