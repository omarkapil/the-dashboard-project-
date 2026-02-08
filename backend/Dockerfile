# Stage 1: Get Subfinder binary
FROM projectdiscovery/subfinder:latest AS subfinder

# Stage 1.5: Get Nuclei binary
FROM projectdiscovery/nuclei:latest AS nuclei

# Stage 2: Final Image
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN echo "Acquire::http::Proxy \"false\";" > /etc/apt/apt.conf.d/99proxy && \
    apt-get -o Acquire::Retries=5 update && \
    apt-get -o Acquire::Retries=5 install -y \
    nmap \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy binaries
COPY --from=subfinder /usr/local/bin/subfinder /usr/local/bin/subfinder
COPY --from=nuclei /usr/local/bin/nuclei /usr/local/bin/nuclei

# Install Trivy
RUN apt-get -o Acquire::Retries=5 update && \
    wget -t 5 https://github.com/aquasecurity/trivy/releases/download/v0.48.3/trivy_0.48.3_Linux-64bit.deb && \
    dpkg -i trivy_0.48.3_Linux-64bit.deb && \
    rm trivy_0.48.3_Linux-64bit.deb && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --default-timeout=100 -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
