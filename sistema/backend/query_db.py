import sqlite3

def print_table(title, headers, rows):
    print(f"\n=== {title} ===")
    if not rows:
        print("Nenhum registro encontrado.")
        return
        
    # Calcular larguras das colunas
    widths = [len(h) for h in headers]
    for row in rows:
        for i, val in enumerate(row):
            widths[i] = max(widths[i], len(str(val)))
            
    # Criar linhas horizontais
    sep = "+" + "+".join("-" * (w + 2) for w in widths) + "+"
    
    # Imprimir cabeçalho
    print(sep)
    header_str = "|" + "|".join(f" {h:<{widths[i]}} " for i, h in enumerate(headers)) + "|"
    print(header_str)
    print(sep)
    
    # Imprimir linhas
    for row in rows:
        row_str = "|" + "|".join(f" {str(val):<{widths[i]}} " for i, val in enumerate(row)) + "|"
        print(row_str)
        
    print(sep)

def inspect_database():
    conn = sqlite3.connect('financeiro.db')
    cursor = conn.cursor()
    
    # 1. Pessoas
    cursor.execute("SELECT id, razao_social, cnpj_cpf, tipo, ativo FROM pessoas")
    print_table("TABELA: PESSOAS (Fornecedores, Clientes, Faturados)", 
                ["ID", "Razão Social / Nome", "CNPJ / CPF", "Tipo", "Ativo"], 
                cursor.fetchall())
                
    # 2. Movimentos
    cursor.execute("""
        SELECT m.id, m.tipo, m.valor_total, m.data_emissao, p.razao_social, f.razao_social 
        FROM movimentocontas m
        LEFT JOIN pessoas p ON m.pessoa_id = p.id
        LEFT JOIN pessoas f ON m.faturado_id = f.id
    """)
    print_table("TABELA: MOVIMENTOCONTAS (Notas Fiscais / Lançamentos)", 
                ["ID", "Tipo", "Valor Total", "Emissão", "Fornecedor", "Faturado (Destinatário)"], 
                cursor.fetchall())
                
    # 3. Classificações
    cursor.execute("SELECT id, descricao, tipo, ativo FROM classificacoes")
    print_table("TABELA: CLASSIFICACOES (Categorias de Gastos/Ganhos)", 
                ["ID", "Descrição", "Tipo", "Ativo"], 
                cursor.fetchall())
                
    # 4. Parcelas
    cursor.execute("SELECT id, movimento_id, identificacao, data_vencimento, valor_parcela, status FROM parcelacontas")
    print_table("TABELA: PARCELACONTAS (Detalhamento de Vencimentos)", 
                ["ID", "Movimento ID", "Identificação", "Vencimento", "Valor Parcela", "Status"], 
                cursor.fetchall())

    conn.close()

if __name__ == "__main__":
    inspect_database()
