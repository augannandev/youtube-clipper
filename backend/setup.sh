#!/bin/bash

# setup.sh - Oracle Cloud ARM VM Setup Script for YouTube Clipper Backend

echo "🚀 Setting up YouTube Clipper Backend on Oracle Cloud ARM VM..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
sudo apt install -y python3-pip python3-venv ffmpeg git curl wget

# Install Node.js (useful for some tools)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/youtube-clipper
sudo chown -R $USER:$USER /opt/youtube-clipper
cd /opt/youtube-clipper

# Clone repository (replace with your actual repo URL)
echo "📥 Cloning repository..."
if [ ! -d "youtube-clipper" ]; then
    git clone https://github.com/your-username/youtube-clipper.git .
fi

# Set up Python virtual environment
echo "🐍 Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# Create systemd service file
echo "⚙️ Creating systemd service..."
sudo tee /etc/systemd/system/youtube-clipper.service > /dev/null <<EOF
[Unit]
Description=YouTube Clipper API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/youtube-clipper/backend
Environment=PATH=/opt/youtube-clipper/venv/bin
ExecStart=/opt/youtube-clipper/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Create environment file
echo "🔐 Creating environment file..."
tee backend/.env > /dev/null <<EOF
# Environment variables for YouTube Clipper API
API_HOST=0.0.0.0
API_PORT=8000
TEMP_DIR=/tmp/youtube-clipper
MAX_CLIP_DURATION=2700  # 45 minutes in seconds
EOF

# Create temp directory
sudo mkdir -p /tmp/youtube-clipper
sudo chown -R $USER:$USER /tmp/youtube-clipper

# Set up firewall rules
echo "🔥 Configuring firewall..."
sudo ufw allow 8000/tcp
sudo ufw allow 22/tcp
sudo ufw --force enable

# Enable and start the service
echo "🚀 Starting YouTube Clipper service..."
sudo systemctl daemon-reload
sudo systemctl enable youtube-clipper
sudo systemctl start youtube-clipper

# Check service status
echo "✅ Checking service status..."
sudo systemctl status youtube-clipper --no-pager

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Service Commands:"
echo "  Start:   sudo systemctl start youtube-clipper"
echo "  Stop:    sudo systemctl stop youtube-clipper"
echo "  Restart: sudo systemctl restart youtube-clipper"
echo "  Status:  sudo systemctl status youtube-clipper"
echo "  Logs:    sudo journalctl -u youtube-clipper -f"
echo ""
echo "🌐 API will be available at: http://YOUR_VM_IP:8000"
echo "📖 API docs: http://YOUR_VM_IP:8000/docs"
echo ""
echo "⚠️  Don't forget to:"
echo "1. Configure Oracle Cloud security rules to allow port 8000"
echo "2. Replace the git clone URL with your actual repository"
echo "3. Set up SSL/TLS with Nginx or Caddy for production" 