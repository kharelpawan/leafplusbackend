#!/bin/bash
# ==========================================================
#  Auto Deploy React Build to Azure Server
# ==========================================================

# === CONFIGURATION ===
SERVER_USER="azureuser"
SERVER_IP="4.186.27.7"
REMOTE_PATH="/var/www/leafplus-factory"  
BUILD_PATH="./build"

# === SCRIPT START ===
echo " Checking build folder..."
if [ ! -d "$BUILD_PATH" ]; then
  echo " Build folder not found! Run 'npm run build' first."
  exit 1
fi

echo " Uploading build files to server..."
scp -r ${BUILD_PATH}/* ${SERVER_USER}@${SERVER_IP}:${REMOTE_PATH}/

if [ $? -ne 0 ]; then
  echo " Upload failed!"
  exit 1
fi

echo " Reloading Nginx on server..."
ssh ${SERVER_USER}@${SERVER_IP} "sudo systemctl reload nginx"

echo " Deployment completed successfully!"
echo " Visit your site: https://factory-leafplus.ibis.com.np"
