#!/bin/bash

# Package YouTube Clipper for Oracle Cloud Deployment

echo "📦 Packaging YouTube Clipper for Oracle Cloud deployment..."

# Create deployment package
echo "🗂️ Creating deployment package..."
tar -czf youtube-clipper-deployment.tar.gz \
    backend/ \
    yclip/ \
    README.md \
    oracle-cloud-setup.md \
    --exclude="backend/__pycache__" \
    --exclude="backend/temp_*" \
    --exclude="yclip/.git" \
    --exclude="*.pyc"

echo "✅ Package created: youtube-clipper-deployment.tar.gz"
echo ""
echo "📋 Next steps:"
echo "1. Sign up for Oracle Cloud: https://signup.cloud.oracle.com/"
echo "2. Follow the guide in oracle-cloud-setup.md"
echo "3. Upload this package to your Oracle Cloud VM:"
echo "   scp -i ~/.ssh/your-key youtube-clipper-deployment.tar.gz ubuntu@YOUR_VM_IP:~/"
echo ""
echo "🌐 After Oracle Cloud setup, deploy frontend to Vercel:"
echo "   cd frontend && npx vercel --prod"
echo ""

ls -lh youtube-clipper-deployment.tar.gz 