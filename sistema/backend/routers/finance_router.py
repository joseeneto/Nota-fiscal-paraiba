from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session, joinedload
import re
from datetime import datetime
from typing import List
from database import get_db
from schemas import NotaFiscalExtraida
from models import Pessoa, Classificacao, MovimentoConta, ParcelaConta, TipoMovimento, TipoPessoa, TipoClassificacao
from services.pdf_service import extract_text_from_pdf
from services.gemini_service import process_nf_text_with_gemini

# Definimos o router do fastapi
router = APIRouter(prefix="/api/financeiro", tags=["Financeiro"])

@router.get("/notas")
def listar_notas(db: Session = Depends(get_db)):
    """Retorna todos os movimentos de contas com dados de fornecedor, parcelas e classificação."""
    movimentos = (
        db.query(MovimentoConta)
        .options(
            joinedload(MovimentoConta.pessoa),
            joinedload(MovimentoConta.parcelas),
            joinedload(MovimentoConta.classificacoes),
        )
        .order_by(MovimentoConta.id.desc())
        .all()
    )
    resultado = []
    for m in movimentos:
        parcelas = [
            {
                "id": p.id,
                "identificacao": p.identificacao,
                "data_vencimento": p.data_vencimento.strftime("%d/%m/%Y") if p.data_vencimento else None,
                "valor_parcela": p.valor_parcela,
                "status": p.status,
            }
            for p in m.parcelas
        ]
        classificacoes = [c.descricao for c in m.classificacoes]
        resultado.append({
            "id": m.id,
            "tipo": m.tipo,
            "valor_total": m.valor_total,
            "data_emissao": m.data_emissao.strftime("%d/%m/%Y") if m.data_emissao else None,
            "fornecedor": m.pessoa.razao_social if m.pessoa else "N/A",
            "fornecedor_doc": m.pessoa.cnpj_cpf if m.pessoa else "N/A",
            "numero_nota": m.parcelas[0].identificacao.split('-')[1] if m.parcelas else "S/N",
            "classificacoes": classificacoes,
            "parcelas": parcelas,
            "total_parcelas": len(parcelas),
            "parcelas_pendentes": sum(1 for p in m.parcelas if p.status == "PENDENTE"),
        })
    return resultado

# Story 3-0: Endpoint de File Upload
@router.post("/extrair-nf", response_model=NotaFiscalExtraida)
async def extrair_nota_fiscal(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Somente arquivos com a extensão .pdf são aceitos.")
        
    try:
        file_bytes = await file.read()
        
        # Story 3-1: Envia para a lib converter PDF para String RAW
        pdf_text = extract_text_from_pdf(file_bytes)
        
        if len(pdf_text) < 10:
            raise HTTPException(status_code=422, detail="Arquivo PDF vazio, protegido por senha ou gerado unicamente por imagens não-Acessíveis.")
            
        # Story 3-2 e 3-3: Envia a str para a LLM ler baseado no System Prompt
        extracao_bruta_dicionario = process_nf_text_with_gemini(pdf_text)
        
        # Passa o Dicionario cru do Gemini via validador restrito do Pydantic (Story 2-0)
        # Para forçar que a tipagem e obrigatoriedade funcionaram.
        dados_validados = NotaFiscalExtraida(**extracao_bruta_dicionario)
        
        return dados_validados
        
    except ValueError as ve:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(ve))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro crítico no processamento da IA: {str(e)}")

def clean_document(doc: str) -> str:
    if not doc:
        return ""
    return re.sub(r'[^0-9]', '', doc)

def checar_nota_duplicada(numero_nf: str, cnpj_limpo: str, db: Session):
    """Verifica se já existe uma nota com o mesmo número e mesmo CNPJ do fornecedor."""
    padrao = f"NF-{numero_nf}-%"
    parcela_existente = (
        db.query(ParcelaConta)
        .join(MovimentoConta, ParcelaConta.movimento_id == MovimentoConta.id)
        .join(Pessoa, MovimentoConta.pessoa_id == Pessoa.id)
        .filter(
            ParcelaConta.identificacao.like(padrao),
            Pessoa.cnpj_cpf == cnpj_limpo,
        )
        .first()
    )
    return parcela_existente is not None

@router.post("/verificar")
def verificar_dados_extraidos(dados: NotaFiscalExtraida, db: Session = Depends(get_db)):
    cnpj_limpo = clean_document(dados.fornecedor.cnpj)
    cpf_limpo = clean_document(dados.faturado.cpf)
    
    fornecedor = db.query(Pessoa).filter(Pessoa.cnpj_cpf == cnpj_limpo).first()
    faturado = db.query(Pessoa).filter(Pessoa.cnpj_cpf == cpf_limpo).first()
    despesa = db.query(Classificacao).filter(Classificacao.descricao == dados.classificacao_despesa.value).first()
    
    # Verifica duplicata: mesma NF + mesmo CNPJ do fornecedor
    duplicada = checar_nota_duplicada(dados.numero_nota_fiscal, cnpj_limpo, db)
    
    return {
        "fornecedor": {
            "existe": fornecedor is not None,
            "mensagem": f"EXISTE - ID: {fornecedor.id}" if fornecedor else "NÃO EXISTE"
        },
        "faturado": {
            "existe": faturado is not None,
            "mensagem": f"EXISTE - ID: {faturado.id}" if faturado else "NÃO EXISTE"
        },
        "despesa": {
            "existe": despesa is not None,
            "mensagem": f"EXISTE - ID: {despesa.id}" if despesa else "NÃO EXISTE"
        },
        "nota_duplicada": {
            "existe": duplicada,
            "mensagem": f"NF-{dados.numero_nota_fiscal} JÁ LANÇADA para este fornecedor" if duplicada else "NÃO DUPLICADA"
        }
    }

@router.post("/confirmar")
def confirmar_lancamento(dados: NotaFiscalExtraida, db: Session = Depends(get_db)):
    try:
        cnpj_limpo = clean_document(dados.fornecedor.cnpj)
        cpf_limpo = clean_document(dados.faturado.cpf)
        
        # Guarda dupla: rejeita se a NF já foi lançada para o mesmo fornecedor
        if checar_nota_duplicada(dados.numero_nota_fiscal, cnpj_limpo, db):
            raise HTTPException(
                status_code=409,
                detail=f"NOTA DUPLICADA: NF-{dados.numero_nota_fiscal} já foi lançada para o CNPJ {dados.fornecedor.cnpj}. Operação cancelada."
            )
        
        # 1. Fornecedor
        fornecedor = db.query(Pessoa).filter(Pessoa.cnpj_cpf == cnpj_limpo).first()
        if not fornecedor:
            fornecedor = Pessoa(
                razao_social=dados.fornecedor.razao_social,
                cnpj_cpf=cnpj_limpo,
                tipo=TipoPessoa.CLIENTE_FORNECEDOR,
                ativo=True
            )
            db.add(fornecedor)
            
        # 2. Faturado
        faturado = db.query(Pessoa).filter(Pessoa.cnpj_cpf == cpf_limpo).first()
        if not faturado:
            faturado = Pessoa(
                razao_social=dados.faturado.nome_completo,
                cnpj_cpf=cpf_limpo,
                tipo=TipoPessoa.FATURADO,
                ativo=True
            )
            db.add(faturado)
            
        # 3. Despesa
        despesa = db.query(Classificacao).filter(Classificacao.descricao == dados.classificacao_despesa.value).first()
        if not despesa:
            despesa = Classificacao(
                descricao=dados.classificacao_despesa.value,
                tipo=TipoClassificacao.DESPESA,
                ativo=True
            )
            db.add(despesa)
            
        # Flush to get IDs if new
        db.flush()
        
        # 4. Movimento de Contas
        try:
            data_emissao_dt = datetime.strptime(dados.data_emissao, "%d/%m/%Y").date()
        except ValueError:
            data_emissao_dt = datetime.now().date()
            
        movimento = MovimentoConta(
            tipo=TipoMovimento.APAGAR,
            valor_total=dados.valor_total,
            data_emissao=data_emissao_dt,
            pessoa_id=fornecedor.id
        )
        movimento.classificacoes.append(despesa)
        db.add(movimento)
        db.flush()
        
        # 5. Parcelas
        # Se não houver data de vencimento válida, usar data_emissao_dt
        data_venc = None
        if dados.data_vencimento:
            try:
                data_venc = datetime.strptime(dados.data_vencimento, "%d/%m/%Y").date()
            except ValueError:
                data_venc = data_emissao_dt
        else:
            data_venc = data_emissao_dt
            
        qtd_parcelas = dados.quantidade_parcelas if dados.quantidade_parcelas > 0 else 1
        valor_por_parcela = dados.valor_total / qtd_parcelas
        
        for i in range(1, qtd_parcelas + 1):
            parcela = ParcelaConta(
                movimento_id=movimento.id,
                identificacao=f"NF-{dados.numero_nota_fiscal}-{i}/{qtd_parcelas}",
                data_vencimento=data_venc, # Pode ser aprimorado para adicionar meses, mas usaremos a mesma base
                valor_parcela=valor_por_parcela,
                status="PENDENTE"
            )
            db.add(parcela)
            
        db.commit()
        
        return {"message": "REGISTRO LANÇADO COM SUCESSO"}
        
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar no banco: {str(e)}")
