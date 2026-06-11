import sqlite3

def run_migration():
    conn = sqlite3.connect('financeiro.db')
    cursor = conn.cursor()
    
    # Verifica se a coluna faturado_id já existe
    cursor.execute("PRAGMA table_info(movimentocontas)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'faturado_id' not in columns:
        print("Adicionando coluna faturado_id na tabela movimentocontas...")
        cursor.execute("ALTER TABLE movimentocontas ADD COLUMN faturado_id INTEGER REFERENCES pessoas(id)")
        conn.commit()
        print("Coluna faturado_id adicionada com sucesso!")
    else:
        print("A coluna faturado_id já existe na tabela movimentocontas.")
        
    conn.close()

if __name__ == "__main__":
    run_migration()
