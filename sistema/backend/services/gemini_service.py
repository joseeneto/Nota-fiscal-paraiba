import os
import json
import time
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Inicializa o cliente da nova SDK google-genai
client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

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
    if not client:
        raise ValueError("Chave da API do Gemini (GEMINI_API_KEY) não está configurada no .env!")
    
    # Retry com backoff para erros 429
    max_retries = 5
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=text,
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            break
        except Exception as e:
            error_str = str(e)
            if ("429" in error_str or "ResourceExhausted" in error_str or "quota" in error_str.lower()):
                wait_time = min(2 ** attempt * 2, 30)
                print(f"[Gemini] Rate limit atingido (tentativa {attempt + 1}/{max_retries}). Aguardando {wait_time}s...")
                time.sleep(wait_time)
                if attempt == max_retries - 1:
                    raise ValueError(
                        f"Limite de requisições da API Gemini excedido após {max_retries} tentativas. "
                        f"Aguarde alguns segundos e tente novamente."
                    )
            else:
                raise
    
    try:
        data = json.loads(response.text)
        return data
    except Exception as e:
        raise ValueError(f"A API Gemini não retornou JSON válido! Saída crua: {response.text}")
