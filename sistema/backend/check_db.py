import sqlite3
import os

db_path = 'financeiro.db'
if not os.path.exists(db_path):
    print(f"Banco de dados não encontrado em: {db_path}")
else:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Listar tabelas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print("Tabelas encontradas:")
        for table in tables:
            print(f"- {table[0]}")
            
        # Para cada tabela, mostrar contagem de registros
        print("\nResumo de registros:")
        for table in tables:
            table_name = table[0]
            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
            count = cursor.fetchone()[0]
            print(f"- {table_name}: {count} registros")
            
        conn.close()
    except Exception as e:
        print(f"Erro ao acessar o banco de dados: {e}")
