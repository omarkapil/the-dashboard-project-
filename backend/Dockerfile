FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for nmap and openvas-cli (if available, generally openvas is complex to install in the same container, but we need the cli tools if possible, or just nmap)
# For this simplified version we focus on nmap. OpenVAS usually runs in a separate container.
RUN apt-get update && apt-get install -y \
    nmap \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
