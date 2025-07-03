#!/bin/bash

# Script to build the SmartShala APK with proper app name, icons, and status bar fixes

# Exit if any command fails
set -e

echo "🚀 Starting SmartShala APK build process..."

# Set production environment
echo "📝 Copying production environment..."
cp .env .env.backup
cp .env.production .env

echo "🔨 Building APK..."
npx eas build -p android --profile apk-mvp

# Restore original files
echo "🔄 Restoring original environment..."
cp .env.backup .env
rm .env.backup

echo "✅ Build process complete!"
echo "The SmartShala APK will be available for download from the EAS dashboard."
echo "You can find it at: https://expo.dev/accounts/adi77/projects/ss-mobile/builds"
echo "⚠️ Note: The build might take some time to complete. You'll receive an email when it's ready."
