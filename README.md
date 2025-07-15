# 🎬 YouTube Clipper - Custom Video Clip Downloader

A full-stack web application that allows users to download custom clips from YouTube videos with precise timestamp selection. Built with React + Tailwind CSS frontend and FastAPI backend.

![YouTube Clipper Demo](https://img.shields.io/badge/Demo-Live-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.6-blue)

## ✨ Features

- 🎯 **Precise Timestamp Selection**: Use YouTube's IFrame API to select exact start and end times
- 📱 **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- ⚡ **Fast Processing**: Efficient video processing using yt-dlp and FFmpeg
- 📥 **Direct Downloads**: Download clips directly to your device
- 🔒 **Quality Control**: Supports up to 720p video quality
- ⏱️ **Duration Limits**: Clips limited to 45 minutes for optimal performance
- 🎛️ **Player Controls**: Built-in video player with seek, play/pause controls

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│   FastAPI API    │───▶│   FFmpeg +      │
│                 │    │                  │    │   yt-dlp        │
│ • YouTube URL   │    │ • Video Download │    │                 │
│ • Player UI     │    │ • Video Clipping │    │ • Process Video │
│ • Timestamp UI  │    │ • File Serving   │    │ • Generate Clip │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.11 or higher)
- **FFmpeg** (for video processing)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/youtube-clipper.git
   cd youtube-clipper
   ```

2. **Setup Backend**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Start the API server
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Create environment file
   cp env.example .env.local
   # Edit .env.local and set VITE_API_URL=http://localhost:8000
   
   # Start development server
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Using Docker Compose (Recommended)

```bash
# Clone and navigate
git clone https://github.com/your-username/youtube-clipper.git
cd youtube-clipper

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## 📦 Deployment

### Option 1: Oracle Cloud Free Tier (Recommended)

Perfect for the free tier with ARM-based VMs:

1. **Create Oracle Cloud VM**
   - VM: VM.Standard.A1.Flex
   - OS: Ubuntu 22.04 ARM
   - CPU: 2 vCPU
   - RAM: 4-8 GB
   - Storage: 50GB+ (for temporary video files)

2. **Configure Security Rules**
   ```bash
   # Allow HTTP traffic on port 8000
   sudo ufw allow 8000/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

3. **Deploy Backend**
   ```bash
   # SSH into your VM
   ssh ubuntu@YOUR_VM_IP
   
   # Clone and run setup script
   git clone https://github.com/your-username/youtube-clipper.git
   cd youtube-clipper
   chmod +x backend/setup.sh
   ./backend/setup.sh
   ```

4. **Deploy Frontend on Vercel**
   - Connect your GitHub repository to Vercel
   - Set environment variable: `VITE_API_URL=http://YOUR_VM_IP:8000`
   - Deploy automatically on push

### Option 2: Docker Deployment

```bash
# On your server
git clone https://github.com/your-username/youtube-clipper.git
cd youtube-clipper

# Create production environment
cp frontend/env.example frontend/.env.production
# Edit .env.production with your server IP

# Deploy with Docker Compose
docker-compose -f docker-compose.yml up -d

# Optional: Set up reverse proxy with Nginx/Caddy for HTTPS
```

### Option 3: Manual Deployment

**Backend (Any VPS)**
```bash
# Install dependencies
sudo apt update && sudo apt install -y python3-pip ffmpeg git

# Clone and setup
git clone https://github.com/your-username/youtube-clipper.git
cd youtube-clipper/backend
pip install -r requirements.txt

# Run with production server
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend (Vercel/Netlify/Static Hosting)**
```bash
cd frontend
npm install
npm run build
# Deploy dist/ folder to your static hosting provider
```

## 🔧 Configuration

### Backend Configuration

Create `backend/.env`:
```env
API_HOST=0.0.0.0
API_PORT=8000
TEMP_DIR=/tmp/youtube-clipper
MAX_CLIP_DURATION=2700  # 45 minutes in seconds
```

### Frontend Configuration

Create `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:8000
# For production: VITE_API_URL=https://your-api-domain.com
```

## 📋 API Documentation

### Endpoints

**POST `/clip`**
- **Description**: Download and clip a YouTube video
- **Body**:
  ```json
  {
    "url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "start_time": "00:01:30",
    "end_time": "00:05:45"
  }
  ```
- **Response**: Video file download

**GET `/health`**
- **Description**: Health check endpoint
- **Response**: 
  ```json
  {
    "status": "healthy",
    "service": "youtube-clipper-api"
  }
  ```

## 🛠️ Development

### Project Structure
```
youtube-clipper/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile          # Backend container
│   └── setup.sh            # Oracle Cloud setup script
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main app component
│   │   └── main.jsx        # Entry point
│   ├── package.json        # Frontend dependencies
│   ├── Dockerfile          # Frontend container
│   └── vite.config.js      # Vite configuration
├── docker-compose.yml      # Multi-container setup
└── README.md              # This file
```

### Adding Features

**Backend (FastAPI)**
- Add new endpoints in `backend/main.py`
- Update requirements in `backend/requirements.txt`
- Follow FastAPI documentation patterns

**Frontend (React)**
- Add components in `frontend/src/components/`
- Use Tailwind CSS for styling
- Follow React best practices

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests  
cd frontend
npm test
```

## 🚨 Troubleshooting

### Common Issues

**"FFmpeg not found"**
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

**"CORS Error"**
- Ensure backend is running on correct port
- Check VITE_API_URL in frontend .env file
- Verify CORS origins in backend/main.py

**"Video download fails"**
- Check if YouTube URL is valid
- Verify yt-dlp is up to date: `pip install --upgrade yt-dlp`
- Some videos may be restricted

**"Clip processing takes too long"**
- Reduce clip duration
- Ensure sufficient server resources
- Check available disk space

### Performance Tips

- **Server Resources**: Minimum 2GB RAM, 2 CPU cores recommended
- **Storage**: Ensure 10GB+ free space for temporary files
- **Network**: Good bandwidth for downloading YouTube videos
- **FFmpeg**: Use hardware acceleration if available

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - YouTube video downloading
- [FFmpeg](https://ffmpeg.org/) - Video processing
- [React](https://reactjs.org/) - Frontend framework
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [Tailwind CSS](https://tailwindcss.com/) - UI styling

## 📞 Support

- 📧 **Email**: your-email@example.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-username/youtube-clipper/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-username/youtube-clipper/discussions)

---

**⚠️ Disclaimer**: This tool is for educational purposes. Please respect YouTube's Terms of Service and copyright laws. Only download videos you have permission to download. 