from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Literal

from database import get_db
from services.rag_service import ask_rag_system

router = APIRouter(prefix="/api/financeiro/rag", tags=["RAG"])

class RagRequest(BaseModel):
    pergunta: str
    tipo_rag: Literal["simples", "embeddings"]

class RagFonte(BaseModel):
    id: int
    texto: str
    score: float
    fornecedor: str
    valor_total: float

class RagResponse(BaseModel):
    pergunta: str
    resposta: str
    tipo_rag: str
    fontes: List[RagFonte]

@router.post("/perguntar", response_model=RagResponse)
def perguntar_ao_rag(dados: RagRequest, db: Session = Depends(get_db)):
    """
    Endpoint de Busca RAG.
    
    Recebe a pergunta do usuário e o tipo de busca (simples ou embeddings),
    executa a busca no banco de dados e retorna a resposta elaborada pelo Gemini
    junto com as fontes utilizadas e seus respectivos scores de relevância.
    """
    if not dados.pergunta.strip():
        raise HTTPException(status_code=400, detail="A pergunta não pode estar vazia.")
        
    try:
        resultado = ask_rag_system(
            query=dados.pergunta,
            tipo_rag=dados.tipo_rag,
            db=db
        )
        return resultado
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Erro crítico no sistema de RAG: {str(e)}"
        )
