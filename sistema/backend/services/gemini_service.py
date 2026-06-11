import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """
Você é um assistente financeiro especializado em análise de Notas Fiscais brasileiras (NF-e/NFS-e).
Sua missão é extrair as informações exatas contidas no texto do PDF da Nota Fiscal.

Retorne APENAS um JSON válido e estrito seguindo este exato modelo (não inclua marcações Markdown na resposta JSON, como ```json):
{
  "fornecedor": {
    "razao_social": "String",
    "fantasia": "String vazio caso nulo",
    "cnpj": "XX.XXX.XXX/XXXX-XX"
  },
  "faturado": {
    "nome_completo": "String",
    "cpf": "XXX.XXX.XXX-XX"
  },
  "numero_nota_fiscal": "String",
  "data_emissao": "DD/MM/AAAA",
  "descricao_produtos": ["descricao array stings"],
  "quantidade_parcelas": 1,
  "data_vencimento": "DD/MM/AAAA",
  "valor_total": 0.0,
  "classificacao_despesa": "Uma STRING baseada nas regras abaixo"
}

REGRAS RÍGIDAS DE CLASSIFICAÇÃO DE DESPESA:
Você deverá analisar criticamente os itens do JSON em "descricao_produtos" e definir um dos valores exatos (Copiado igual) para "classificacao_despesa":
1. "INSUMOS AGRÍCOLAS": Sementes, Fertilizantes, Defensivos Agrícolas, Corretivos.
2. "MANUTENÇÃO E OPERAÇÃO": Óleo Diesel, Combustíveis, Lubrificantes, Peças, Parafusos, Componentes Mecânicos, Manutenção, Pneus, Filtros, Ferramentas.
3. "RECURSOS HUMANOS": Mão de Obra Temporária, Salários e Encargos.
4. "SERVIÇOS OPERACIONAIS": Frete e Transporte, Colheita, Secagem e Armazenagem, Pulverização.
5. "INFRAESTRUTURA E UTILIDADES": Energia Elétrica, Arrendamento, Construções, Materiais de Construção, Material Hidráulico.
6. "ADMINISTRATIVAS": Honorários (Contábeis, Advocatícios), Despesas Financeiras.
7. "SEGUROS E PROTEÇÃO": Seguro Agrícola, Seguro Veículos, Seguro Prestamista.
8. "IMPOSTOS E TAXAS": ITR, IPTU, IPVA, INCRA-CCIR.
9. "INVESTIMENTOS": Aquisição de Máquinas e Implementos, Veículos, Imóveis, Infraestrutura Rural.

Atenção, se o modelo contiver Material Hidráulico (exigido na documentação), force categorizar como INFRAESTRUTURA E UTILIDADES.

Extraia com o maior grau de precisão. 
REGRA CRÍTICA PARA DATAS: Se a Nota Fiscal não possuir uma "Data de Vencimento" explícita, você deve retornar o campo "data_vencimento" como uma string vazia "". EM HIPÓTESE ALGUMA copie a "data_emissao" para o campo de vencimento se ele não existir no documento.

Se falhar em encontrar qualquer outro campo obrigatório, coloque texto vazio "" ou float 0.0.

"""

def process_nf_text_with_gemini(text: str) -> dict:
    if not GEMINI_API_KEY:
        raise ValueError("Chave da API do Gemini (GEMINI_API_KEY) não está configurada no .env!")
        
    generation_config = genai.GenerationConfig(
        response_mime_type="application/json"
    )
    
    # Flash é veloz e ideal para extração baseada em texto JSON Model.
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        generation_config=generation_config,
        system_instruction=SYSTEM_PROMPT
    )
    
    response = model.generate_content(text)
    
    try:
        data = json.loads(response.text)
        return data
    except Exception as e:
        raise ValueError(f"A API Gemini não retornou JSON válido! Saída crua: {response.text}")
