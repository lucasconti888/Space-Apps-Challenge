# ======================
# Etapa base
# ======================
FROM python:3.11-slim

# Define diretório de trabalho
WORKDIR /app

# Copia arquivos necessários
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do projeto
COPY . .

# Expõe a porta usada pelo Uvicorn
EXPOSE 8080

# Variáveis de ambiente (ajuste conforme seu caso)
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# Comando para iniciar o servidor FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
