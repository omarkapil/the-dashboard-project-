# Stage 1: Get Subfinder binary
FROM projectdiscovery/subfinder:latest AS subfinder

# Stage 2: Final Image
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nmap \
    && rm -rf /var/lib/apt/lists/*

# Copy subfinder binary from Stage 1
COPY --from=subfinder /usr/local/bin/subfinder /usr/local/bin/subfinder

# Install Trivy
RUN apt-get update && apt-get install -y wget && \
    apt-get update && \
    wget https://github.com/aquasecurity/trivy/releases/download/v0.48.3/trivy_0.48.3_Linux-64bit.deb && \
    dpkg -i trivy_0.48.3_Linux-64bit.deb && \
    rm trivy_0.48.3_Linux-64bit.deb && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --default-timeout=100 -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
