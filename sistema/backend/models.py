from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Table, Date, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum

# Tabela associativa para a relação Muitos-para-Muitos entre Movimentos e Classificações
movimento_classificacao = Table(
    'movimento_classificacao',
    Base.metadata,
    Column('movimento_id', Integer, ForeignKey('movimentocontas.id')),
    Column('classificacao_id', Integer, ForeignKey('classificacoes.id'))
)

class TipoPessoa(str, enum.Enum):
    CLIENTE = "CLIENTE"
    FORNECEDOR = "FORNECEDOR"
    FATURADO = "FATURADO"
    CLIENTE_FORNECEDOR = "CLIENTE-FORNECEDOR"

class TipoClassificacao(str, enum.Enum):
    RECEITA = "RECEITA"
    DESPESA = "DESPESA"

class TipoMovimento(str, enum.Enum):
    APAGAR = "APAGAR"
    ARECEBER = "ARECEBER"

class Pessoa(Base):
    __tablename__ = "pessoas"
    
    id = Column(Integer, primary_key=True, index=True)
    razao_social = Column(String, index=True)
    cnpj_cpf = Column(String, unique=True, index=True)
    tipo = Column(String) # Pode ser múltiplos? O enunciado diz Tipo(CLIENTE-FORNECEDOR)
    ativo = Column(Boolean, default=True)
    
    movimentos = relationship("MovimentoConta", foreign_keys="[MovimentoConta.pessoa_id]", back_populates="pessoa")

class Classificacao(Base):
    __tablename__ = "classificacoes"
    
    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String, unique=True, index=True)
    tipo = Column(String) # RECEITA ou DESPESA
    ativo = Column(Boolean, default=True)
    
    movimentos = relationship("MovimentoConta", secondary=movimento_classificacao, back_populates="classificacoes")

class MovimentoConta(Base):
    __tablename__ = "movimentocontas"
    
    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String) # APAGAR ou ARECEBER
    valor_total = Column(Float)
    data_emissao = Column(Date)
    pessoa_id = Column(Integer, ForeignKey("pessoas.id"))
    faturado_id = Column(Integer, ForeignKey("pessoas.id"), nullable=True)
    
    pessoa = relationship("Pessoa", foreign_keys=[pessoa_id], back_populates="movimentos")
    faturado = relationship("Pessoa", foreign_keys=[faturado_id])
    classificacoes = relationship("Classificacao", secondary=movimento_classificacao, back_populates="movimentos")
    parcelas = relationship("ParcelaConta", back_populates="movimento", cascade="all, delete-orphan")

class ParcelaConta(Base):
    __tablename__ = "parcelacontas"
    
    id = Column(Integer, primary_key=True, index=True)
    movimento_id = Column(Integer, ForeignKey("movimentocontas.id"))
    identificacao = Column(String) # Única por movimento
    data_vencimento = Column(Date)
    valor_parcela = Column(Float)
    status = Column(String, default="PENDENTE")
    
    movimento = relationship("MovimentoConta", back_populates="parcelas")

class DocumentEmbedding(Base):
    __tablename__ = "document_embeddings"
    
    id = Column(Integer, primary_key=True, index=True)
    movimento_id = Column(Integer, ForeignKey("movimentocontas.id", ondelete="CASCADE"), unique=True)
    text_hash = Column(String)
    embedding_json = Column(String)

