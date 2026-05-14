# Story 5-3: Fluxo de Persistência e Lançamento Automático

**Objetivo:**
Realizar o lançamento completo no sistema, criando cadastros faltantes e registrando a movimentação financeira e suas parcelas.

**Tarefas a serem executadas:**
1. Criar o endpoint `POST /api/financeiro/confirmar` que executa atatomicamente:
   - Cria o Fornecedor (se não existir).
   - Cria o Faturado (se não existir).
   - Cria a Classificação de Despesa (se não existir).
   - Cria o Registro de Movimento de Contas (`MOVIMENTOCONTAS`).
   - Cria as Parcelas do movimento (`PARCELACONTAS`) com suas respectivas datas de vencimento.
2. Garantir que o `tipo` do fornecedor seja gravado como `CLIENTE-FORNECEDOR` e o faturado como `FATURADO`.
3. Retornar mensagem de sucesso ao usuário após o commit no banco.

**Critérios de Aceite:**
- Todos os registros devem estar vinculados corretamente (FKs).
- Se houver falha em qualquer etapa, a transação deve sofrer Rollback (integridade de dados).
- O sistema deve informar claramente que o registro foi lançado com sucesso.
