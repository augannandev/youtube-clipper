# Dockerfile for Railway deployment
# This builds the backend service from the monorepo

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Create temp directory for video processing
RUN mkdir -p /tmp/youtube-clipper

# Expose port (Railway will assign dynamically)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Run the application (Railway uses $PORT env variable)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
