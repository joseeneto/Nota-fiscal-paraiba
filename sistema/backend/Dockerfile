FROM python:3.10-slim

WORKDIR /app

# Instalar dependências de sistema necessárias para build de pacotes
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Instalar uvicorn se não estiver no requirements
RUN pip install --no-cache-dir uvicorn

# Copiar o restante da aplicação
COPY . .

# Expor porta 8000
EXPOSE 8000

# Comando para rodar
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
