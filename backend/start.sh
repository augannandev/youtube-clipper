#!/bin/bash
# Railway start script

# Install system dependencies if needed
if ! command -v ffmpeg &> /dev/null; then
    echo "Installing ffmpeg..."
    apt-get update && apt-get install -y ffmpeg
fi

# Start the FastAPI application
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
