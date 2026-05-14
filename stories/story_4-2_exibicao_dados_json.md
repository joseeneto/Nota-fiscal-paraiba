# Story 4-2: Exibição dos Dados Extraídos (Frontend Layout - FIGURA 2)

**Objetivo:**
Terminar a experiência exibindo os dados já trabalhados pela IA para validação final visual pelo usuário, de acordo com o modelo de visualização JSON ou Cards da Figura 2 do documento.

**Tarefas a serem executadas:**
1. Adicionar o state `extractedData` ao componente principal com o retorno de payload (`response.data`).
2. Projetar a área de exibição baseada na FIGURA 2, caso exiba na forma estrita e em bloco do JSON gerado, utilizar bibliotecas simples como `<pre><code>{JSON.stringify(data, null, 2)}</code></pre>` com higlighting de sintaxe e cor de fundo Dark Mode (mais atrativo) para as chaves JSON e Valores.
3. Adicionar lógica de rolagem (overflow-y-auto e overflow-x-auto) para o payload de JSON caso seja uma nota longa, evitando "quebrar/vazar" a interface com barras laterais pesadas.
4. Adicionar um botão de limpar ("Nova Limpeza / Resetar") permitindo que o estado volte ao estado inicial (Limpando o `extractedData`, o `File input`, voltando ao estado idêntico à *Story 4-0* de *Aguardando Arquivo* sem a necessidade de atualizar F5 na página).

**Critérios de Aceite:**
- O usuário deve ver o resultado do JSON colorido e formatado na tela (exatamente como demonstrado num renderizador de json estético).
- O fluxo "Analisar Nova Nota Fiscal" (Clear State) deve estar impecável, pronto para o próximo teste de NF.
