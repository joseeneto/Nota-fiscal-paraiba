from pydantic import BaseModel, Field
from typing import List
from enum import Enum

class CategoriaDespesa(str, Enum):
    INSUMOS_AGRICOLAS = "INSUMOS AGRÍCOLAS"
    MANUTENCAO_E_OPERACAO = "MANUTENÇÃO E OPERAÇÃO"
    RECURSOS_HUMANOS = "RECURSOS HUMANOS"
    SERVICOS_OPERACIONAIS = "SERVIÇOS OPERACIONAIS"
    INFRAESTRUTURA_E_UTILIDADES = "INFRAESTRUTURA E UTILIDADES"
    ADMINISTRATIVAS = "ADMINISTRATIVAS"
    SEGUROS_E_PROTECAO = "SEGUROS E PROTEÇÃO"
    IMPOSTOS_E_TAXAS = "IMPOSTOS E TAXAS"
    INVESTIMENTOS = "INVESTIMENTOS"

class Fornecedor(BaseModel):
    razao_social: str = Field(..., description="Razão Social do fornecedor")
    fantasia: str = Field(..., description="Nome Fantasia do fornecedor, se houver")
    cnpj: str = Field(..., description="CNPJ do fornecedor no formato XX.XXX.XXX/XXXX-XX")

class Faturado(BaseModel):
    nome_completo: str = Field(..., description="Nome Completo do Faturado (Cliente/Destinatário)")
    cpf: str = Field(..., description="CPF do Faturado no formato XXX.XXX.XXX-XX")

class NotaFiscalExtraida(BaseModel):
    fornecedor: Fornecedor
    faturado: Faturado
    numero_nota_fiscal: str = Field(..., description="O número numérico ou alfanumérico da Nota Fiscal")
    data_emissao: str = Field(..., description="Data de emissão da NF (DD/MM/AAAA)")
    descricao_produtos: List[str] = Field(..., description="Lista descrevendo cada produto ou serviço contido na NF")
    quantidade_parcelas: int = Field(default=1, description="O número de parcelas contidas na nota")
    data_vencimento: str = Field(..., description="A data de vencimento da fatura/parcela (DD/MM/AAAA). Caso não exista, retorna string vazia.")
    valor_total: float = Field(..., description="O valor financeiro total da Nota Fiscal em formato decimal")
    classificacao_despesa: CategoriaDespesa = Field(
        ..., 
        description="Categoria inferida baseando-se na lista de produtos. Exemplo: Se tiver produtos hidráulicos, será INFRAESTRUTURA E UTILIDADES."
    )

class EntidadeVerificacao(BaseModel):
    existe: bool
    mensagem: str

class VerificacaoResponse(BaseModel):
    fornecedor: EntidadeVerificacao
    faturado: EntidadeVerificacao
    despesa: EntidadeVerificacao

class NotaLancadaList(BaseModel):
    id: int
    fornecedor: str
    valor_total: float
    data_emissao: str
    classificacao: str
    qtd_parcelas: int

# Novos schemas para Pessoas
class PessoaBase(BaseModel):
    razao_social: str
    cnpj_cpf: str
    tipo: str

class PessoaCreate(PessoaBase):
    pass

class PessoaUpdate(BaseModel):
    razao_social: str = None
    cnpj_cpf: str = None
    tipo: str = None

class PessoaOut(PessoaBase):
    id: int
    ativo: bool

    class Config:
        from_attributes = True

# Novos schemas para Classificacoes
class ClassificacaoBase(BaseModel):
    descricao: str
    tipo: str

class ClassificacaoCreate(ClassificacaoBase):
    pass

class ClassificacaoUpdate(BaseModel):
    descricao: str = None
    tipo: str = None

class ClassificacaoOut(ClassificacaoBase):
    id: int
    ativo: bool

    class Config:
        from_attributes = True

# Schema para Atualização de Conta (MovimentoConta)
class MovimentoContaUpdate(BaseModel):
    tipo: str = None
    valor_total: float = None
    data_emissao: str = None
    pessoa_id: int = None
    faturado_id: int = None
