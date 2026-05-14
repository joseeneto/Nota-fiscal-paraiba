# Story 5-1: Modelagem das Entidades Administrativo-Financeiras

**Objetivo:**
Mapear as entidades de negócio exigidas pelo projeto no Banco de Dados utilizando o ORM SQLAlchemy, garantindo as regras de integridade e tipos definidos.

**Tarefas a serem executadas:**
1. Criar o arquivo `models.py` com as seguintes classes:
   - **Pessoa**: Campos `id`, `razao_social`, `cnpj_cpf`, `tipo` (Enum: CLIENTE-FORNECEDOR, FATURADO), `ativo` (Boolean default True).
   - **Classificacao**: Campos `id`, `tipo` (Enum: RECEITA, DESPESA), `descricao`, `ativo` (Boolean default True).
   - **MovimentoContas**: Campos `id`, `tipo` (Enum: APAGAR, ARECEBER), `valor_total`, `data_emissao`, `fornecedor_id` (FK), `faturado_id` (FK).
   - **ParcelaContas**: Campos `id`, `movimento_id` (FK), `identificacao` (ÚNICA), `data_vencimento`, `valor`, `status`.
2. Criar a tabela de associação Many-to-Many entre `MovimentoContas` e `Classificacao` (uma conta pode ter uma ou mais despesas/receitas).
3. Implementar a lógica de criação das tabelas no startup do app (ou via migration).

**Critérios de Aceite:**
- As tabelas devem ser criadas corretamente no PostgreSQL.
- A regra de "não exclusão, apenas inativação" deve ser respeitada através do campo `ativo`.
- A identificação das parcelas deve ser única.
