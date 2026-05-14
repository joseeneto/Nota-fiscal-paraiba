# Story 4-1: Action Button e Integração (Loading State)

**Objetivo:**
Criar o meio de transporte, o "gatilho", que avisa o modelo e o backend que o usuário quer rodar a IA agora. Lidar com o gerenciamento de estados no React.

**Tarefas a serem executadas:**
1. Criar e posicionar o botão "✅ Iniciar Extração de Dados" utilizando cores de contraste (Primary Color).
2. Criar uma função assíncrona `handleSubmit(e)` com `api.post(...)` mandando o `FormData` com o File para a rota `POST /api/financeiro/extrair-nf` criada em *Story 3-0*.
3. Implementar o gerenciamento do State (`useState`) e gerenciar o `loading` = `true/false`.
4. Renderizar um *Loading Indicator* (ex: skeleton loading ou spinner moderno + mensagem "A IA está processando o seu documento... Isso pode levar alguns segundos") enquanto aguarda a response (que pelo Gemini toma cerca de 4 a 8 segundos).

**Critérios de Aceite:**
- O botão só pode ser clicado caso exista um arquivo válido inserido.
- Se já foi clicado, o botão tem que ficar *Disabled* para que o usuário não rode a IA repetidas vezes acidentalmente.
- Mensagens de toast (notificação) em caso de erro na rede ou erro do backend (ex: Erro Interno 500 ou Retorno Inválido).
