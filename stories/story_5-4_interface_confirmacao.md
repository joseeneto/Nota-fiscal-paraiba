# Story 5-4: Interface de Conferência e Lançamento (Frontend)

**Objetivo:**
Adaptar a tela de extração para exibir os resultados da análise do banco de dados e permitir o lançamento final pelo usuário.

**Tarefas a serem executadas:**
1. Atualizar o componente `NfExtraction.tsx` para realizar uma segunda chamada automática (ou via botão) ao endpoint de `/verificar` após a extração da IA.
2. Criar um card de exibição estruturado que mostre:
   - Fornecedor + CNPJ + Status (Badge Verde/Vermelho).
   - Faturado + CPF + Status.
   - Despesa + Status.
3. Adicionar o botão "Confirmar e Lançar no Financeiro" que chama o endpoint de `/confirmar`.
4. Implementar feedback visual de sucesso (Toast ou Alert de Sucesso) e redirecionar ou limpar o formulário.

**Critérios de Aceite:**
- A visualização deve seguir o padrão: `EXISTE – ID: XX` em verde ou `NÃO EXISTE` em vermelho.
- O botão de confirmação só deve estar habilitado se a extração tiver sido bem-sucedida.
- O layout deve ser responsivo e esteticamente premium.
