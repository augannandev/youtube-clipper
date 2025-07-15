# Oracle Cloud Deployment Guide for YouTube Clipper

## 1. Oracle Cloud Account Setup

1. **Sign up**: Go to https://signup.cloud.oracle.com/
2. **Choose**: "Always Free" account type
3. **Complete**: Email verification, phone verification, credit card verification
4. **Wait**: 10-30 minutes for account activation

## 2. Create a VM Instance

1. **Log in** to Oracle Cloud Console
2. **Navigate**: Compute → Instances → Create Instance
3. **Configure**:
   - **Name**: `youtube-clipper-backend`
   - **Image**: Ubuntu 22.04 (Always Free Eligible)
   - **Shape**: VM.Standard.A1.Flex (ARM) - 1 OCPU, 6GB RAM (Free)
   - **Networking**: Create new VCN or use existing
   - **SSH Keys**: Upload your public SSH key or create new

4. **Security Rules**: In your VCN → Security Lists → Default Security List
   - Add Ingress Rule: Port 8000, Source: 0.0.0.0/0

## 3. Upload Your Code to Oracle Cloud

After VM is created, get the public IP and run these commands locally:

```bash
# From your local youtube-clipper directory
tar -czf youtube-clipper.tar.gz backend/ frontend/ yclip/ requirements.txt

# Upload to Oracle Cloud (replace YOUR_VM_IP with actual IP)
scp -i ~/.ssh/your-key youtube-clipper.tar.gz ubuntu@YOUR_VM_IP:~/
```

## 4. Setup on Oracle Cloud VM

SSH into your VM and run:

```bash
# SSH into VM
ssh -i ~/.ssh/your-key ubuntu@YOUR_VM_IP

# Extract files
tar -xzf youtube-clipper.tar.gz

# Install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv ffmpeg

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# Create systemd service
sudo tee /etc/systemd/system/youtube-clipper.service > /dev/null <<EOF
[Unit]
Description=YouTube Clipper API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/backend
Environment=PATH=/home/ubuntu/venv/bin
ExecStart=/home/ubuntu/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# Start service
sudo systemctl daemon-reload
sudo systemctl enable youtube-clipper
sudo systemctl start youtube-clipper

# Check status
sudo systemctl status youtube-clipper
```

## 5. Deploy Frontend to Vercel

1. **Sign up**: Go to https://vercel.com (GitHub login recommended)
2. **Deploy**:
   ```bash
   # From your local frontend directory
   npx vercel login
   npx vercel --prod
   ```
3. **Set Environment Variable**:
   - In Vercel dashboard → Your Project → Settings → Environment Variables
   - Add: `VITE_API_URL` = `http://YOUR_ORACLE_VM_IP:8000`

## 6. Test Your Deployment

- **Backend**: http://YOUR_ORACLE_VM_IP:8000/health
- **Frontend**: Your Vercel URL (e.g., https://youtube-clipper-frontend.vercel.app)

## 🎉 You're Live!

Your YouTube clipper is now deployed globally with:
- ✅ Free Oracle Cloud backend (ARM processor, 6GB RAM)
- ✅ Free Vercel frontend (Global CDN)
- ✅ Up to 4K video quality
- ✅ Automatic file cleanup 