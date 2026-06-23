import os
import re
import math
import json
import hashlib
import time
from google import genai
from google.genai import types
from sqlalchemy.orm import Session, joinedload
from dotenv import load_dotenv

from models import MovimentoConta, DocumentEmbedding, Pessoa, Classificacao, ParcelaConta

def get_gemini_client():
    """Obtém o cliente Gemini recarregando o .env a cada chamada para pegar chaves atualizadas."""
    load_dotenv(override=True)
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None
    return genai.Client(api_key=api_key)

STOPWORDS = {
    'de', 'do', 'da', 'o', 'a', 'e', 'em', 'um', 'uma', 'para', 'com', 'no', 'na', 
    'os', 'as', 'dos', 'das', 'que', 'se', 'ao', 'aos', 'por', 'mais', 'como', 'meu',
    'minha', 'teu', 'tua', 'seu', 'sua', 'nossos', 'nossas', 'esta', 'este', 'isto',
    'aquilo', 'ela', 'ele', 'elas', 'eles', 'nos', 'vos', 'qual', 'quais', 'quem', 
    'quanto', 'quantos', 'como', 'onde', 'quando', 'porque'
}

def clean_doc_text(text: str) -> str:
    """Limpa o texto para indexação e busca simples."""
    return re.sub(r'\s+', ' ', text).strip()

def build_document_text(m: MovimentoConta) -> str:
    """Monta a representação em texto estruturado de um MovimentoConta e seus relacionamentos."""
    tipo_desc = "A PAGAR (Despesa / Gasto / Saída)" if m.tipo == "APAGAR" else "A RECEBER (Receita / Faturamento / Entrada)"
    fornecedor_nome = m.pessoa.razao_social if m.pessoa else "Não cadastrado"
    fornecedor_doc = m.pessoa.cnpj_cpf if m.pessoa else "Não cadastrado"
    fornecedor_tipo = m.pessoa.tipo if m.pessoa else "Não cadastrado"
    
    classificacoes_str = ", ".join([c.descricao for c in m.classificacoes]) if m.classificacoes else "Sem classificação"
    
    parcelas_list = []
    if m.parcelas:
        for p in m.parcelas:
            venc_str = p.data_vencimento.strftime("%d/%m/%Y") if p.data_vencimento else "Não informada"
            parcelas_list.append(
                f"Identificação Parcela: {p.identificacao}, Valor: R$ {p.valor_parcela:.2f}, Vencimento: {venc_str}, Status de Pagamento: {p.status}"
            )
        parcelas_str = "\n  - ".join(parcelas_list)
    else:
        parcelas_str = "Sem parcelas registradas."
        
    emissao_str = m.data_emissao.strftime("%d/%m/%Y") if m.data_emissao else "Não informada"
    
    text = f"""Informações do Lançamento Financeiro ID {m.id}:
- Tipo de Operação: {tipo_desc}
- Fornecedor ou Cliente (Pessoa): {fornecedor_nome}
- CPF ou CNPJ do Fornecedor ou Cliente: {fornecedor_doc}
- Tipo da Relação (Pessoa): {fornecedor_tipo}
- Valor Total do Lançamento: R$ {m.valor_total:.2f}
- Data de Emissão da Nota: {emissao_str}
- Categorias / Classificações de Despesa ou Receita: {classificacoes_str}
- Detalhamento das Parcelas:
  - {parcelas_str}"""
    return clean_doc_text(text)

def get_hash(text: str) -> str:
    """Calcula o SHA256 do texto para verificação de alterações."""
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def _call_with_retry(api_call, max_retries=4):
    """
    Executa uma chamada à API com retry e backoff para erros 429.
    Free tier do Gemini: 5 req/min para gemini-2.0-flash, 15 RPM para embeddings.
    Espera o suficiente para o rate limit resetar sem causar timeout no cliente.
    """
    for attempt in range(max_retries):
        try:
            return api_call()
        except Exception as e:
            error_str = str(e)
            # Erro de autenticação - não faz sentido retry
            if "401" in error_str or "UNAUTHENTICATED" in error_str or "ACCESS_TOKEN_TYPE_UNSUPPORTED" in error_str:
                raise ValueError(
                    "Chave de API do Gemini inválida ou expirada. "
                    "Verifique se a GEMINI_API_KEY no .env é uma chave válida do Google AI Studio (https://aistudio.google.com/apikey). "
                    "Chaves válidas geralmente começam com 'AIza'."
                )
            # Erro de permissão
            if "403" in error_str or "PERMISSION_DENIED" in error_str:
                raise ValueError(
                    "Erro de permissão (403) na API do Gemini. "
                    "Causas comuns:\n"
                    "1. A API 'Generative Language API' não está ativada no projeto do Google Cloud associado à chave.\n"
                    "2. A chave de API não tem permissão para acessar o modelo solicitado.\n"
                    "3. Restrições de região (alguns modelos não estão disponíveis em certas regiões sem faturamento ativo).\n"
                    f"Detalhe do erro original: {error_str}"
                )
            # Verifica se é erro de rate limiting (429)
            if "429" in error_str or "ResourceExhausted" in error_str or "quota" in error_str.lower():
                wait_time = min((attempt + 1) * 5, 15)  # 5s, 10s, 15s, 15s
                print(f"[RAG] Rate limit atingido (tentativa {attempt + 1}/{max_retries}). Aguardando {wait_time}s...")
                time.sleep(wait_time)
                if attempt == max_retries - 1:
                    raise ValueError(
                        f"Limite de requisições da API Gemini excedido após {max_retries} tentativas. "
                        f"O plano gratuito permite apenas 5 requisições por minuto. "
                        f"Aguarde ~30 segundos e tente novamente."
                    )
            else:
                raise

def generate_text_embedding(text: str, is_query: bool = False) -> list[float]:
    """Chama a API do Gemini para gerar embeddings usando a nova SDK google-genai."""
    client = get_gemini_client()
    if not client:
        raise ValueError("Chave de API do Gemini (GEMINI_API_KEY) não encontrada no .env")
        
    task_type = "RETRIEVAL_QUERY" if is_query else "RETRIEVAL_DOCUMENT"
    
    def _embed():
        response = client.models.embed_content(
            model="gemini-embedding-2",
            contents=text,
            config=types.EmbedContentConfig(task_type=task_type)
        )
        return response.embeddings[0].values
    
    try:
        return _call_with_retry(_embed)
    except Exception as e:
        print(f"[RAG] Erro ao usar gemini-embedding-2: {e}. Tentando fallback para gemini-embedding-001...")
        def _embed_fallback():
            response = client.models.embed_content(
                model="gemini-embedding-001",
                contents=text,
                config=types.EmbedContentConfig(task_type=task_type)
            )
            return response.embeddings[0].values
        return _call_with_retry(_embed_fallback)

def get_all_documents_with_embeddings(db: Session) -> list[dict]:
    """Retorna todos os documentos textuais e seus embeddings (do cache ou gerando novos)."""
    movimentos = (
        db.query(MovimentoConta)
        .options(
            joinedload(MovimentoConta.pessoa),
            joinedload(MovimentoConta.classificacoes),
            joinedload(MovimentoConta.parcelas)
        )
        .all()
    )
    
    results = []
    embeddings_generated = 0
    
    for m in movimentos:
        doc_text = build_document_text(m)
        text_hash = get_hash(doc_text)
        
        # Procura cache no banco
        cached = db.query(DocumentEmbedding).filter(DocumentEmbedding.movimento_id == m.id).first()
        
        embedding_list = None
        if cached and cached.text_hash == text_hash:
            try:
                embedding_list = json.loads(cached.embedding_json)
            except Exception:
                pass
                
        if embedding_list is None:
            # Rate limiting: pausa entre chamadas de embedding para não estourar o limite
            if embeddings_generated > 0 and embeddings_generated % 4 == 0:
                print(f"[RAG] Pausando brevemente para respeitar rate limit da API... ({embeddings_generated} embeddings gerados)")
                time.sleep(12)
            
            # Gera novo embedding
            print(f"[RAG] Gerando novo embedding para Movimento ID {m.id}...")
            embedding_list = generate_text_embedding(doc_text, is_query=False)
            embeddings_generated += 1
            
            # Atualiza ou cria o registro no cache
            if cached:
                cached.text_hash = text_hash
                cached.embedding_json = json.dumps(embedding_list)
            else:
                db_embedding = DocumentEmbedding(
                    movimento_id=m.id,
                    text_hash=text_hash,
                    embedding_json=json.dumps(embedding_list)
                )
                db.add(db_embedding)
            db.commit()
            
        results.append({
            "id": m.id,
            "text": doc_text,
            "embedding": embedding_list,
            "fornecedor": m.pessoa.razao_social if m.pessoa else "N/A",
            "valor_total": m.valor_total
        })
        
    return results

def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    """Calcula a similaridade de cosseno entre dois vetores."""
    if len(v1) != len(v2):
        return 0.0
    dot_prod = sum(x * y for x, y in zip(v1, v2))
    mag1 = math.sqrt(sum(x * x for x in v1))
    mag2 = math.sqrt(sum(y * y for y in v2))
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot_prod / (mag1 * mag2)

def search_rag_simples(query: str, db: Session, top_k: int = 100) -> list[dict]:
    """RAG Simples: Busca por correspondência de palavras-chave."""
    # Limpeza da query
    query_cleaned = re.sub(r'[^\w\s]', ' ', query.lower())
    query_words = [w for w in query_cleaned.split() if w and w not in STOPWORDS]
    
    if not query_words:
        query_words = [w for w in query_cleaned.split() if w]
        
    movimentos = (
        db.query(MovimentoConta)
        .options(
            joinedload(MovimentoConta.pessoa),
            joinedload(MovimentoConta.classificacoes),
            joinedload(MovimentoConta.parcelas)
        )
        .all()
    )
    
    scored_docs = []
    for m in movimentos:
        doc_text = build_document_text(m)
        doc_lower = doc_text.lower()
        
        score = 0
        for word in query_words:
            # Standalone word match gets higher score
            pattern = r'\b' + re.escape(word) + r'\b'
            if re.search(pattern, doc_lower):
                score += 3
            elif word in doc_lower:
                score += 1
                
        scored_docs.append({
            "id": m.id,
            "text": doc_text,
            "score": score,
            "fornecedor": m.pessoa.razao_social if m.pessoa else "N/A",
            "valor_total": m.valor_total
        })
        
    # Ordena pelo score e filtra apenas scores > 0
    scored_docs.sort(key=lambda x: x["score"], reverse=True)
    filtered = [d for d in scored_docs if d["score"] > 0]
    
    # Se nada combinou, não retorna todos os 10000. Retorna no máximo os 5 mais recentes para não travar a API.
    if not filtered:
        return scored_docs[:5]
        
    return filtered[:top_k]

def search_rag_embeddings(query: str, db: Session, top_k: int = 100) -> list[dict]:
    """RAG Embeddings: Busca semântica usando similaridade de vetores."""
    query_embedding = generate_text_embedding(query, is_query=True)
    documents = get_all_documents_with_embeddings(db)
    
    scored_docs = []
    for doc in documents:
        similarity = cosine_similarity(query_embedding, doc["embedding"])
        scored_docs.append({
            "id": doc["id"],
            "text": doc["text"],
            "score": float(similarity),
            "fornecedor": doc["fornecedor"],
            "valor_total": doc["valor_total"]
        })
        
    # Ordena pela similaridade
    scored_docs.sort(key=lambda x: x["score"], reverse=True)
    return scored_docs[:top_k]

def ask_rag_system(query: str, tipo_rag: str, db: Session) -> dict:
    """Orquestra a busca RAG e gera a resposta fundamentada com o Gemini."""
    client = get_gemini_client()
    if not client:
        raise ValueError("Chave de API do Gemini não configurada no .env")
        
    # 1. Recupera documentos com base no tipo
    if tipo_rag.lower() == "embeddings":
        sources = search_rag_embeddings(query, db)
        method_label = "RAG Embeddings (Busca Semântica)"
    else:
        sources = search_rag_simples(query, db)
        method_label = "RAG Simples (Busca por Palavra-Chave)"
        
    # 2. Constrói o contexto para o prompt
    context_parts = []
    for idx, s in enumerate(sources):
        score_label = f"Similaridade: {s['score']:.4f}" if tipo_rag.lower() == "embeddings" else f"Pontuação de Palavra-chave: {s['score']}"
        context_parts.append(f"--- Documento Fonte #{idx+1} (ID Lançamento: {s['id']}, Fornecedor: {s['fornecedor']}, {score_label}) ---\n{s['text']}")
        
    context_str = "\n\n".join(context_parts)
    
    # 3. Monta o Prompt Rígido
    system_prompt = f"""Você é um assistente financeiro inteligente da empresa Nota-fiscal-paraiba.
Sua tarefa é responder à pergunta do usuário sobre os dados financeiros contidos no banco de dados.

Você deve responder com base APENAS no Contexto fornecido na mensagem.
Se a resposta não puder ser obtida através do Contexto, responda honestamente que não encontrou informações correspondentes no banco de dados.
Sempre formate valores monetários em Reais (R$) e datas no formato DD/MM/AAAA.
Organize a resposta de forma muito clara, legível e profissional. Use tópicos ou tabelas Markdown se for útil para resumir dados.
"""

    user_prompt = f"""Pergunta do Usuário: {query}

Contexto Recuperado via {method_label}:
{context_str}
"""

    # 4. Chama o Gemini com retry para 429
    def _generate():
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.2
            )
        )
        return response
    
    try:
        response = _call_with_retry(_generate)
        resposta_text = response.text
    except ValueError as e:
        # Se a API falhar (key inválida, cota etc.), no modo simples retorna os dados brutos
        error_msg = str(e)
        print(f"[RAG] Erro na geração Gemini: {error_msg}")
        if tipo_rag.lower() == "simples" and sources:
            # Monta uma resposta resumida com os dados encontrados sem precisar do Gemini
            resumo_parts = []
            for s in sources[:10]:
                resumo_parts.append(f"- **{s['fornecedor']}**: R$ {s['valor_total']:.2f} (ID: {s['id']})")
            resposta_text = (
                f"[AVISO] A IA não está disponível no momento ({error_msg}). "
                f"Abaixo estão os dados encontrados por busca de palavras-chave:\n\n"
                + "\n".join(resumo_parts)
            )
        else:
            raise
    
    # Retorna os dados no formato esperado
    return {
        "pergunta": query,
        "resposta": resposta_text,
        "tipo_rag": tipo_rag,
        "fontes": [
            {
                "id": s["id"],
                "texto": s["text"],
                "score": s["score"],
                "fornecedor": s["fornecedor"],
                "valor_total": s["valor_total"]
            }
            for s in sources
        ]
    }
