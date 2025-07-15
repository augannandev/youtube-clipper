import os
import tempfile
import asyncio
import subprocess
from pathlib import Path
from typing import Optional
import shutil
import re

from fastapi import FastAPI, HTTPException, Response, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, validator
import yt_dlp

app = FastAPI(
    title="YouTube Clipper API",
    description="API for downloading and clipping YouTube videos",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ClipRequest(BaseModel):
    url: str
    start_time: str  # HH:MM:SS format
    end_time: str    # HH:MM:SS format
    
    @validator('url')
    def validate_youtube_url(cls, v):
        youtube_regex = re.compile(
            r'(https?://)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)/'
            r'(watch\?v=|embed/|v/|.+\?v=)?([^&=%\?]{11})'
        )
        if not youtube_regex.match(v):
            raise ValueError('Invalid YouTube URL')
        return v
    
    @validator('start_time', 'end_time')
    def validate_time_format(cls, v):
        time_regex = re.compile(r'^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$')
        if not time_regex.match(v):
            raise ValueError('Time must be in HH:MM:SS format')
        return v

def time_to_seconds(time_str: str) -> int:
    """Convert HH:MM:SS to seconds"""
    parts = time_str.split(':')
    return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])

def validate_duration(start_time: str, end_time: str) -> None:
    """Validate that clip duration is within limits"""
    start_seconds = time_to_seconds(start_time)
    end_seconds = time_to_seconds(end_time)
    
    if end_seconds <= start_seconds:
        raise HTTPException(status_code=400, detail="End time must be after start time")
    
    duration = end_seconds - start_seconds
    max_duration = 45 * 60  # 45 minutes in seconds
    
    if duration > max_duration:
        raise HTTPException(status_code=400, detail=f"Clip duration cannot exceed 45 minutes. Requested: {duration//60} minutes")

async def download_video(url: str, output_path: str) -> str:
    """Download YouTube video using yt-dlp"""
    ydl_opts = {
        # Download highest quality available (up to 4K if available)
        # Prefer mp4 format for better compatibility with ffmpeg
        'format': 'bestvideo[ext=mp4][height<=2160]+bestaudio[ext=m4a]/bestvideo[height<=2160]+bestaudio/best[height<=2160]/best',
        'outtmpl': os.path.join(output_path, '%(title)s.%(ext)s'),
        'quiet': True,
        'no_warnings': True,
        # Merge video and audio into single file
        'merge_output_format': 'mp4',
        # Use faster download options
        'concurrent_fragment_downloads': 4,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Get video info first
            info = ydl.extract_info(url, download=False)
            title = info.get('title', 'video')
            
            # Download the video
            ydl.download([url])
            
            # Find the downloaded file
            for file in os.listdir(output_path):
                if file.startswith(title.replace('/', '_')[:50]):  # Truncate long titles
                    return os.path.join(output_path, file)
            
            # Fallback: return the first video file found
            for file in os.listdir(output_path):
                if file.endswith(('.mp4', '.webm', '.mkv')):
                    return os.path.join(output_path, file)
                    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to download video: {str(e)}")

async def clip_video(input_path: str, output_path: str, start_time: str, end_time: str) -> str:
    """Clip video using ffmpeg"""
    try:
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-ss', start_time,
            '-to', end_time,
            '-c:v', 'copy',  # Copy video stream without re-encoding (preserves quality)
            '-c:a', 'copy',  # Copy audio stream without re-encoding
            '-avoid_negative_ts', 'make_zero',
            '-map_metadata', '0',  # Copy metadata
            '-movflags', '+faststart',  # Optimize for web streaming
            output_path,
            '-y'  # Overwrite output file
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            raise HTTPException(status_code=500, detail=f"FFmpeg error: {stderr.decode()}")
            
        return output_path
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clip video: {str(e)}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "YouTube Clipper API is running"}

@app.post("/clip")
async def create_clip(request: ClipRequest, background_tasks: BackgroundTasks):
    """
    Download and clip a YouTube video
    """
    # Validate duration
    validate_duration(request.start_time, request.end_time)
    
    # Create temporary directory
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Download video
        print(f"Downloading video from: {request.url}")
        video_path = await download_video(request.url, temp_dir)
        
        if not video_path or not os.path.exists(video_path):
            raise HTTPException(status_code=500, detail="Failed to download video")
        
        # Generate output filename
        output_filename = f"clip_{request.start_time.replace(':', '-')}_to_{request.end_time.replace(':', '-')}.mp4"
        output_path = os.path.join(temp_dir, output_filename)
        
        # Clip video
        print(f"Clipping video from {request.start_time} to {request.end_time}")
        clipped_path = await clip_video(video_path, output_path, request.start_time, request.end_time)
        
        if not os.path.exists(clipped_path):
            raise HTTPException(status_code=500, detail="Failed to create clip")
        
        # Add cleanup task to be run after response
        def cleanup():
            """Cleanup function to remove temp files after download"""
            try:
                shutil.rmtree(temp_dir)
            except:
                pass
        
        background_tasks.add_task(cleanup)
        
        return FileResponse(
            clipped_path,
            media_type='video/mp4',
            filename=output_filename
        )
        
    except HTTPException:
        # Clean up on error
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise
    except Exception as e:
        # Clean up on error
        shutil.rmtree(temp_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint for deployment"""
    return {"status": "healthy", "service": "youtube-clipper-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 