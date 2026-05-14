from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.finance_router import router as finance_router

from database import engine, Base
import models

# Cria as tabelas no banco de dados se não existirem
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Financeiro - Extração de NF", version="1.0.0")

# Essencial para que o React Frontend chamando da porta 5173 não dê Blocked by CORS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Adiciona ao app central o roteador que criamos.
app.include_router(finance_router)

@app.get("/")
def read_root():
    return {"message": "API Financeira - Processador de PDF Iniciado e rodando..."}
