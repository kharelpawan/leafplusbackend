#!/bin/bash

SERVER_USER="azureuser"
SERVER_IP="4.186.27.7"
SERVER_DIR="/home/azureuser/leafplus"
ARCHIVE_NAME="/tmp/leafplus_deploy.tar.gz"
PM2_APP_NAME="leafplus-backend"

# Compress project excluding node_modules and .git
echo "📦 Compressing project..."
tar --exclude="node_modules" --exclude=".git" -czf $ARCHIVE_NAME .

# Upload to server
echo "📤 Uploading to server..."
scp $ARCHIVE_NAME $SERVER_USER@$SERVER_IP:~/

# Deploy on server
echo "🚀 Deploying on server..."
ssh -tt -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << EOF
  set -e
  mkdir -p $SERVER_DIR
  cd $SERVER_DIR

  echo "🧹 Cleaning old files..."
  rm -rf * || true

  echo "📦 Extracting new files..."
  tar -xzf ~/$(basename $ARCHIVE_NAME) --strip-components=1 -C $SERVER_DIR
  rm ~/$(basename $ARCHIVE_NAME)

  echo "📥 Installing dependencies..."
  npm install --production

  echo "🔁 Restarting PM2 process..."
  pm2 restart $PM2_APP_NAME || pm2 start server.js --name $PM2_APP_NAME

  echo "✅ Deployment completed successfully!"
EOF

# Cleanup local archive
rm $ARCHIVE_NAME
echo "🧹 Local cleanup done."
