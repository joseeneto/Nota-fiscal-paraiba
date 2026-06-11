import sys
import os

# Adiciona o diretório atual ao path para importar corretamente
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from services.rag_service import ask_rag_system

def run_test():
    db = SessionLocal()
    try:
        print("=== TESTANDO RAG SIMPLES ===")
        pergunta = "Qual o valor total de todas as contas a pagar lançadas?"
        r_simples = ask_rag_system(pergunta, "simples", db)
        print(f"Pergunta: {r_simples['pergunta']}")
        print(f"Resposta:\n{r_simples['resposta']}")
        print(f"Fontes encontradas: {len(r_simples['fontes'])}")
        for f in r_simples['fontes']:
            print(f"- ID {f['id']}: Fornecedor '{f['fornecedor']}', Valor: R$ {f['valor_total']:.2f}, Score: {f['score']}")
        
        print("\n=== TESTANDO RAG EMBEDDINGS ===")
        r_emb = ask_rag_system(pergunta, "embeddings", db)
        print(f"Pergunta: {r_emb['pergunta']}")
        print(f"Resposta:\n{r_emb['resposta']}")
        print(f"Fontes encontradas: {len(r_emb['fontes'])}")
        for f in r_emb['fontes']:
            print(f"- ID {f['id']}: Fornecedor '{f['fornecedor']}', Valor: R$ {f['valor_total']:.2f}, Score: {f['score']:.4f}")
            
    except Exception as e:
        print(f"Erro no teste: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    run_test()
