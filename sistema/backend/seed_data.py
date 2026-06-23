"""
Script para gerar dados aleatórios de notas fiscais no banco de dados.
Gera no mínimo 200 movimentos (notas) com fornecedores, faturados,
classificações e parcelas realistas.
"""

import random
import sqlite3
from datetime import date, timedelta

# ──────────────────────────────────────────────
# Dados realistas para geração
# ──────────────────────────────────────────────

NOMES_EMPRESAS = [
    "Agro Norte Insumos", "Fertibras Ltda", "Sementes Brasil S.A.",
    "TratoPeças Comércio", "AgroVida Nutrição Animal", "Irrigatech Sistemas",
    "Colheita Fácil Máquinas", "BioFertil Orgânicos", "Ração Premium Ltda",
    "Defensivos Sul S.A.", "HidroAgro Soluções", "Campo Verde Distribuidora",
    "Terras Altas Consultoria", "MecAgro Oficina", "Silo Master Armazéns",
    "Cerealista Paraíba", "Pecuária Plus Ltda", "SoloTech Análises",
    "Pulveriza Já Serviços", "EletroCampo Energia", "Vet Saúde Animal",
    "TransAgro Logística", "Safra Certa Seguros", "ContaAgro Assessoria",
    "RuralNet Tecnologia", "AduboMax Fertilizantes", "GrãoFino Beneficiamento",
    "Trator Força Locações", "Apiário Flores do Campo", "Laticínios Serra Verde",
    "Frigorífico Norte PB", "Curtume Sertão", "Madeireira Caatinga",
    "Ferragens Borborema", "Posto Combustível Agrícola", "Elétrica Rural PB",
    "Tintas e Pinturas Agreste", "Vidraçaria Campo Belo", "Serralheria Progresso",
    "Construtora Terra Nova", "Engenharia Sertaneja", "Topografia Exata",
    "Laboratório AgroTest", "Farmácia Veterinária PB", "Papelaria Escritório Rural",
    "Gráfica Impressão Ágil", "Segurança Patrimonial SP", "Limpeza Total Serviços",
    "Refeitório Sabor Rural", "Uniformes Agro Vestir",
]

NOMES_PESSOAS = [
    "José da Silva", "Maria Aparecida Santos", "João Pedro Oliveira",
    "Ana Carolina Souza", "Carlos Eduardo Lima", "Francisca Pereira",
    "Antônio Fernandes", "Luciana Barbosa", "Paulo Roberto Costa",
    "Mariana Rodrigues", "Pedro Henrique Alves", "Juliana Nascimento",
    "Roberto Carlos Gomes", "Fernanda Cavalcanti", "Ricardo Monteiro",
    "Cláudia Regina Dias", "Marcos Vinícius Araújo", "Patrícia Lopes",
    "Rafael Augusto Melo", "Sandra Helena Cardoso", "Luís Felipe Ribeiro",
    "Adriana Mendes", "Thiago Batista", "Camila Teixeira",
    "Gustavo Henrique Nunes", "Beatriz Carvalho", "Leonardo Pinto",
    "Isabela Moreira", "Felipe Andrade", "Larissa Freitas",
    "Eduardo Martins", "Vanessa Correia", "Bruno Figueiredo",
    "Daniela Rocha", "Vinícius Campos", "Aline Ferreira",
    "Renato Bezerra", "Priscila Dantas", "Márcio Nogueira",
    "Tatiana Medeiros",
]

# Classificações por tipo com produtos associados
CLASSIFICACOES_DESPESA = {
    "INSUMOS AGRÍCOLAS": [
        "Fertilizante NPK 10-10-10", "Herbicida Glifosato", "Semente de milho híbrido",
        "Calcário dolomítico", "Adubo orgânico", "Inseticida Cipermetrina",
        "Fungicida Mancozeb", "Semente de soja", "Ureia granulada",
        "Sulfato de amônio", "Micronutrientes foliares",
    ],
    "MANUTENÇÃO E OPERAÇÃO": [
        "Filtro de óleo para trator", "Correia de transmissão", "Pneu agrícola R20",
        "Óleo hidráulico 20L", "Jogo de lâminas para colheitadeira",
        "Rolamento 6205", "Graxa multiuso", "Vela de ignição NGK",
        "Bateria automotiva 150Ah", "Disco de corte 7 polegadas",
    ],
    "RECURSOS HUMANOS": [
        "Folha de pagamento mensal", "Encargos sociais INSS", "FGTS mensal",
        "Vale transporte", "Cesta básica funcionários", "EPI - Bota de segurança",
        "EPI - Luva de proteção", "Exame admissional", "Treinamento NR-31",
        "Plano de saúde empresarial",
    ],
    "SERVIÇOS OPERACIONAIS": [
        "Serviço de pulverização aérea", "Análise de solo laboratorial",
        "Consultoria agronômica", "Transporte de safra", "Colheita mecanizada terceirizada",
        "Desinfecção de galpão", "Serviço de topografia", "Perfuração de poço artesiano",
        "Manutenção preventiva irrigação", "Assistência técnica veterinária",
    ],
    "INFRAESTRUTURA E UTILIDADES": [
        "Tubulação PVC 100mm", "Bomba d'água 3CV", "Caixa d'água 5000L",
        "Fio elétrico 4mm", "Disjuntor 40A", "Poste de concreto 9m",
        "Telha fibrocimento", "Cimento CP-II 50kg", "Areia lavada m³",
        "Brita nº 1 m³", "Vergalhão 10mm", "Registro gaveta 1 pol",
    ],
    "ADMINISTRATIVAS": [
        "Material de escritório", "Toner impressora", "Serviço de contabilidade",
        "Assinatura software gestão", "Telefonia e internet", "Aluguel escritório",
        "Correios e encomendas", "Serviço de limpeza", "Água mineral escritório",
        "Manutenção ar condicionado",
    ],
    "SEGUROS E PROTEÇÃO": [
        "Seguro agrícola safra", "Seguro de maquinário", "Seguro de veículos",
        "Seguro contra incêndio", "Seguro de vida funcionários",
        "Seguro responsabilidade civil",
    ],
    "IMPOSTOS E TAXAS": [
        "ITR - Imposto Territorial Rural", "IPVA veículos", "Taxa de licenciamento",
        "Contribuição sindical", "Taxa ambiental IBAMA", "Alvará de funcionamento",
        "DARF recolhimento federal",
    ],
    "INVESTIMENTOS": [
        "Compra de trator novo", "Aquisição de colheitadeira", "Construção de silo",
        "Implantação sistema irrigação", "Compra de terreno adjacente",
        "Reforma de curral", "Aquisição de drone agrícola",
    ],
}

CLASSIFICACOES_RECEITA = {
    "VENDA DE PRODUÇÃO": [
        "Venda de soja em grão", "Venda de milho", "Venda de algodão em pluma",
        "Venda de cana-de-açúcar", "Venda de feijão", "Venda de café",
    ],
    "PRESTAÇÃO DE SERVIÇOS": [
        "Serviço de beneficiamento", "Locação de maquinário", "Armazenagem de grãos",
        "Assistência técnica prestada",
    ],
    "OUTRAS RECEITAS": [
        "Aluguel de pastagem", "Venda de subprodutos", "Bonificação de fornecedor",
    ],
}


def gerar_cnpj():
    """Gera um CNPJ aleatório formatado (sem validação de dígitos)."""
    n = [random.randint(0, 9) for _ in range(8)]
    filial = random.randint(1, 50)
    dig = random.randint(10, 99)
    return f"{n[0]}{n[1]}.{n[2]}{n[3]}{n[4]}.{n[5]}{n[6]}{n[7]}/{filial:04d}-{dig:02d}"


def gerar_cpf():
    """Gera um CPF aleatório formatado (sem validação de dígitos)."""
    n = [random.randint(0, 9) for _ in range(9)]
    dig = random.randint(10, 99)
    return f"{n[0]}{n[1]}{n[2]}.{n[3]}{n[4]}{n[5]}.{n[6]}{n[7]}{n[8]}-{dig:02d}"


def gerar_data_aleatoria(inicio: date, fim: date) -> date:
    """Retorna uma data aleatória entre inicio e fim."""
    delta = (fim - inicio).days
    return inicio + timedelta(days=random.randint(0, delta))


def seed_database(num_notas: int = 220):
    """Popula o banco com dados aleatórios."""
    conn = sqlite3.connect("financeiro.db")
    cursor = conn.cursor()

    # ── 1. Limpar dados existentes ──
    print("[*] Limpando dados existentes...")
    for table in [
        "document_embeddings",
        "movimento_classificacao",
        "parcelacontas",
        "movimentocontas",
        "classificacoes",
        "pessoas",
    ]:
        try:
            cursor.execute(f"DELETE FROM {table}")
        except sqlite3.OperationalError:
            pass  # tabela pode não existir

    conn.commit()

    # ── 2. Inserir Pessoas (Fornecedores) ──
    print("[+] Criando fornecedores...")
    fornecedores_ids = []
    for i, nome in enumerate(NOMES_EMPRESAS, 1):
        cnpj = gerar_cnpj()
        cursor.execute(
            "INSERT INTO pessoas (id, razao_social, cnpj_cpf, tipo, ativo) VALUES (?, ?, ?, ?, ?)",
            (i, nome, cnpj, "FORNECEDOR", True),
        )
        fornecedores_ids.append(i)

    # ── 3. Inserir Pessoas (Faturados / Clientes) ──
    print("[+] Criando faturados/clientes...")
    faturados_ids = []
    offset = len(NOMES_EMPRESAS)
    for i, nome in enumerate(NOMES_PESSOAS, 1):
        cpf = gerar_cpf()
        pessoa_id = offset + i
        cursor.execute(
            "INSERT INTO pessoas (id, razao_social, cnpj_cpf, tipo, ativo) VALUES (?, ?, ?, ?, ?)",
            (pessoa_id, nome, cpf, "FATURADO", True),
        )
        faturados_ids.append(pessoa_id)

    conn.commit()

    # ── 4. Inserir Classificações ──
    print("[+] Criando classificacoes...")
    class_id = 1
    classificacao_map = {}  # descricao -> id

    for descricao in CLASSIFICACOES_DESPESA:
        cursor.execute(
            "INSERT INTO classificacoes (id, descricao, tipo, ativo) VALUES (?, ?, ?, ?)",
            (class_id, descricao, "DESPESA", True),
        )
        classificacao_map[descricao] = class_id
        class_id += 1

    for descricao in CLASSIFICACOES_RECEITA:
        cursor.execute(
            "INSERT INTO classificacoes (id, descricao, tipo, ativo) VALUES (?, ?, ?, ?)",
            (class_id, descricao, "RECEITA", True),
        )
        classificacao_map[descricao] = class_id
        class_id += 1

    conn.commit()

    # ── 5. Gerar Movimentos (Notas Fiscais) ──
    print(f"[+] Gerando {num_notas} notas fiscais...")

    data_inicio = date(2024, 1, 1)
    data_fim = date(2026, 6, 10)

    for mov_id in range(1, num_notas + 1):
        # 75% despesas (A PAGAR), 25% receitas (A RECEBER)
        is_despesa = random.random() < 0.75
        tipo_mov = "APAGAR" if is_despesa else "ARECEBER"

        # Escolher classificação e produtos
        if is_despesa:
            classif_nome = random.choice(list(CLASSIFICACOES_DESPESA.keys()))
            produtos = random.sample(
                CLASSIFICACOES_DESPESA[classif_nome],
                k=min(random.randint(1, 4), len(CLASSIFICACOES_DESPESA[classif_nome])),
            )
        else:
            classif_nome = random.choice(list(CLASSIFICACOES_RECEITA.keys()))
            produtos = random.sample(
                CLASSIFICACOES_RECEITA[classif_nome],
                k=min(random.randint(1, 3), len(CLASSIFICACOES_RECEITA[classif_nome])),
            )

        # Valor total realista baseado na categoria
        faixas_valor = {
            "INSUMOS AGRÍCOLAS": (500, 50000),
            "MANUTENÇÃO E OPERAÇÃO": (200, 15000),
            "RECURSOS HUMANOS": (1500, 80000),
            "SERVIÇOS OPERACIONAIS": (800, 40000),
            "INFRAESTRUTURA E UTILIDADES": (300, 25000),
            "ADMINISTRATIVAS": (100, 8000),
            "SEGUROS E PROTEÇÃO": (1000, 30000),
            "IMPOSTOS E TAXAS": (200, 20000),
            "INVESTIMENTOS": (10000, 500000),
            "VENDA DE PRODUÇÃO": (5000, 200000),
            "PRESTAÇÃO DE SERVIÇOS": (1000, 50000),
            "OUTRAS RECEITAS": (500, 20000),
        }

        val_min, val_max = faixas_valor.get(classif_nome, (100, 10000))
        valor_total = round(random.uniform(val_min, val_max), 2)

        # Datas
        data_emissao = gerar_data_aleatoria(data_inicio, data_fim)

        # Pessoas
        pessoa_id = random.choice(fornecedores_ids)
        faturado_id = random.choice(faturados_ids) if random.random() < 0.7 else None

        # Inserir movimento
        cursor.execute(
            """INSERT INTO movimentocontas 
               (id, tipo, valor_total, data_emissao, pessoa_id, faturado_id, ativo) 
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (mov_id, tipo_mov, valor_total, data_emissao.isoformat(), pessoa_id, faturado_id, True),
        )

        # Vincular classificação
        classif_id = classificacao_map[classif_nome]
        cursor.execute(
            "INSERT INTO movimento_classificacao (movimento_id, classificacao_id) VALUES (?, ?)",
            (mov_id, classif_id),
        )

        # ── 6. Gerar Parcelas ──
        num_parcelas = random.choices(
            [1, 2, 3, 4, 6, 10, 12],
            weights=[40, 20, 15, 10, 8, 5, 2],
            k=1,
        )[0]

        valor_parcela_base = round(valor_total / num_parcelas, 2)
        # Ajustar resto para a última parcela
        soma_parcelas = valor_parcela_base * (num_parcelas - 1)
        valor_ultima = round(valor_total - soma_parcelas, 2)

        for p in range(1, num_parcelas + 1):
            data_vencimento = data_emissao + timedelta(days=30 * p)
            identificacao = f"NF-{mov_id:05d}/{p:02d}"
            valor_p = valor_parcela_base if p < num_parcelas else valor_ultima

            # Status baseado na data
            if data_vencimento < date.today():
                status = random.choices(
                    ["PAGO", "VENCIDO"],
                    weights=[85, 15],
                    k=1,
                )[0]
            else:
                status = random.choices(
                    ["PENDENTE", "PAGO"],
                    weights=[75, 25],
                    k=1,
                )[0]

            cursor.execute(
                """INSERT INTO parcelacontas 
                   (movimento_id, identificacao, data_vencimento, valor_parcela, status) 
                   VALUES (?, ?, ?, ?, ?)""",
                (mov_id, identificacao, data_vencimento.isoformat(), valor_p, status),
            )

        # Progresso
        if mov_id % 50 == 0:
            print(f"   [OK] {mov_id}/{num_notas} notas geradas...")

    conn.commit()

    # ── Relatorio final ──
    print("\n" + "=" * 60)
    print("[OK] SEED CONCLUIDO COM SUCESSO!")
    print("=" * 60)

    for tabela, label in [
        ("pessoas", "Pessoas (Fornecedores + Faturados)"),
        ("classificacoes", "Classificacoes"),
        ("movimentocontas", "Movimentos (Notas Fiscais)"),
        ("parcelacontas", "Parcelas"),
        ("movimento_classificacao", "Vinculos Movimento <-> Classificacao"),
    ]:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {tabela}")
            count = cursor.fetchone()[0]
            print(f"   [#] {label}: {count} registros")
        except sqlite3.OperationalError:
            pass

    # Resumo financeiro
    cursor.execute("SELECT tipo, COUNT(*), SUM(valor_total) FROM movimentocontas GROUP BY tipo")
    rows = cursor.fetchall()
    print("\n   [$] Resumo Financeiro:")
    for tipo, qtd, total in rows:
        label = "A Pagar (Despesas)" if tipo == "APAGAR" else "A Receber (Receitas)"
        print(f"      {label}: {qtd} notas | R$ {total:,.2f}")

    cursor.execute(
        "SELECT status, COUNT(*), SUM(valor_parcela) FROM parcelacontas GROUP BY status"
    )
    rows = cursor.fetchall()
    print("\n   [i] Status das Parcelas:")
    for status, qtd, total in rows:
        print(f"      {status}: {qtd} parcelas | R$ {total:,.2f}")

    conn.close()
    print("\nPronto! Execute 'python query_db.py' para visualizar os dados.")


if __name__ == "__main__":
    seed_database(350)
