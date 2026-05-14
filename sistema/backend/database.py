import os
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

# Se não houver DB_URL, usamos SQLite para desenvolvimento local simples
# Mas o padrão para entrega será PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./financeiro.db")

# Ajuste para compatibilidade com SQLAlchemy 2.0 + SQLite/Postgres
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
