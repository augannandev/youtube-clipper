#!/bin/bash
# Entrypoint script for Railway deployment

# Use PORT from environment, default to 8000 if not set
PORT=${PORT:-8000}

echo "Starting uvicorn on port $PORT..."

# Start the FastAPI application
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
