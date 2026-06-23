from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import Classificacao
from schemas import ClassificacaoCreate, ClassificacaoUpdate, ClassificacaoOut

router = APIRouter(prefix="/api/classificacoes", tags=["Classificações"], redirect_slashes=False)

@router.get("/", response_model=List[ClassificacaoOut])
def listar_classificacoes(
    buscar: Optional[str] = Query(None, description="Termo de busca na descrição ou tipo"),
    db: Session = Depends(get_db)
):
    query = db.query(Classificacao).filter(Classificacao.ativo == True)
    
    if buscar:
        termo = f"%{buscar}%"
        query = query.filter(
            (Classificacao.descricao.ilike(termo)) | 
            (Classificacao.tipo.ilike(termo))
        )
        
    return query.order_by(Classificacao.descricao.asc()).all()

@router.post("/", response_model=ClassificacaoOut)
def criar_classificacao(dados: ClassificacaoCreate, db: Session = Depends(get_db)):
    nova_classificacao = Classificacao(
        descricao=dados.descricao,
        tipo=dados.tipo,
        ativo=True
    )
    db.add(nova_classificacao)
    try:
        db.commit()
        db.refresh(nova_classificacao)
        return nova_classificacao
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erro ao criar classificação. Verifique se já existe.")

@router.put("/{class_id}", response_model=ClassificacaoOut)
def atualizar_classificacao(class_id: int, dados: ClassificacaoUpdate, db: Session = Depends(get_db)):
    classificacao = db.query(Classificacao).filter(Classificacao.id == class_id, Classificacao.ativo == True).first()
    if not classificacao:
        raise HTTPException(status_code=404, detail="Classificação não encontrada")
        
    if dados.descricao is not None:
        classificacao.descricao = dados.descricao
    if dados.tipo is not None:
        classificacao.tipo = dados.tipo
        
    try:
        db.commit()
        db.refresh(classificacao)
        return classificacao
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erro ao atualizar classificação.")

@router.delete("/{class_id}")
def excluir_classificacao(class_id: int, db: Session = Depends(get_db)):
    classificacao = db.query(Classificacao).filter(Classificacao.id == class_id, Classificacao.ativo == True).first()
    if not classificacao:
        raise HTTPException(status_code=404, detail="Classificação não encontrada")
        
    # Exclusão lógica
    classificacao.ativo = False
    db.commit()
    return {"message": "Classificação excluída com sucesso (status inativo)"}
