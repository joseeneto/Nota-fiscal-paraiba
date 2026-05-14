# Story 3-2: Prompt Engineering do Gemini (Classificação e Regras de Negócio)

**Objetivo:**
"Treinar e orientar" o assistente de inteligência artificial (Gemini) sobre como ler a nota fiscal e, o mais importante, como ele deve julgar sozinho as regras de negócio para classificar cada despesa da Nota.

**Tarefas a serem executadas:**
1. Criar e testar o `System Prompt` num arquivo de constantes/serviços (ex: `services/gemini_prompts.py`).
2. Configurar rigorosamente a lista de instruções passadas para a LLM:
   - Apresentar cada categoria (Ex: "MANUTENÇÃO E OPERAÇÃO: Combustíveis e Lubrificantes, Peças, Parafusos...").
   - Informar que "Compra de Óleo Diesel -> MANUTENÇÃO E OPERAÇÃO".
   - Descrever perfeitamente as categorias de "INSUMOS AGRÍCOLAS", "RECURSOS HUMANOS", "SERVIÇOS OPERACIONAIS", "INFRAESTRUTURA E UTILIDADES", "ADMINISTRATIVAS", "SEGUROS E PROTEÇÃO", "IMPOSTOS E TAXAS", "INVESTIMENTOS".
3. Orientar que caso existam categorias não mapeadas, tente usar o bom senso na categoria mais semelhante.

**Critérios de Aceite:**
- O texto do Prompt deve conter absolutamente todos os exemplos base descritos nas regras de negócios da primeira avaliação N2, orientando o comportamento da IA.
