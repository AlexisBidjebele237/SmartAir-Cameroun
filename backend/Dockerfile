# Stage 1: Build dependencies
FROM python:3.11-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Production image
FROM python:3.11-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy application code into a 'backend' subdirectory to preserve package structure
COPY . ./backend/

# Ensure the app can find the backend package
ENV PYTHONPATH=/app

EXPOSE 8000

# Command to run the application using the module path
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
