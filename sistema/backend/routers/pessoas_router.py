from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import Pessoa
from schemas import PessoaCreate, PessoaUpdate, PessoaOut

router = APIRouter(prefix="/api/pessoas", tags=["Pessoas"], redirect_slashes=False)

@router.get("/", response_model=List[PessoaOut])
def listar_pessoas(
    buscar: Optional[str] = Query(None, description="Termo de busca (Razão Social ou CNPJ/CPF)"),
    db: Session = Depends(get_db)
):
    query = db.query(Pessoa).filter(Pessoa.ativo == True)
    
    if buscar:
        termo = f"%{buscar}%"
        query = query.filter(
            (Pessoa.razao_social.ilike(termo)) | 
            (Pessoa.cnpj_cpf.ilike(termo)) |
            (Pessoa.tipo.ilike(termo))
        )
        
    return query.order_by(Pessoa.razao_social.asc()).all()

@router.post("/", response_model=PessoaOut)
def criar_pessoa(dados: PessoaCreate, db: Session = Depends(get_db)):
    nova_pessoa = Pessoa(
        razao_social=dados.razao_social,
        cnpj_cpf=dados.cnpj_cpf,
        tipo=dados.tipo,
        ativo=True
    )
    db.add(nova_pessoa)
    try:
        db.commit()
        db.refresh(nova_pessoa)
        return nova_pessoa
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erro ao criar pessoa. Verifique se o CPF/CNPJ já existe.")

@router.put("/{pessoa_id}", response_model=PessoaOut)
def atualizar_pessoa(pessoa_id: int, dados: PessoaUpdate, db: Session = Depends(get_db)):
    pessoa = db.query(Pessoa).filter(Pessoa.id == pessoa_id, Pessoa.ativo == True).first()
    if not pessoa:
        raise HTTPException(status_code=404, detail="Pessoa não encontrada")
        
    if dados.razao_social is not None:
        pessoa.razao_social = dados.razao_social
    if dados.cnpj_cpf is not None:
        pessoa.cnpj_cpf = dados.cnpj_cpf
    if dados.tipo is not None:
        pessoa.tipo = dados.tipo
        
    try:
        db.commit()
        db.refresh(pessoa)
        return pessoa
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Erro ao atualizar pessoa.")

@router.delete("/{pessoa_id}")
def excluir_pessoa(pessoa_id: int, db: Session = Depends(get_db)):
    pessoa = db.query(Pessoa).filter(Pessoa.id == pessoa_id, Pessoa.ativo == True).first()
    if not pessoa:
        raise HTTPException(status_code=404, detail="Pessoa não encontrada")
        
    # Exclusão lógica
    pessoa.ativo = False
    db.commit()
    return {"message": "Pessoa excluída com sucesso (status inativo)"}
