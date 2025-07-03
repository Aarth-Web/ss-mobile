#!/bin/bash

# Script to build the SmartShala APK with proper app name, icons, and status bar fixes

# Exit if any command fails
set -e

echo "🚀 Starting SmartShala APK build process..."

# Set production environment
echo "📝 Copying production environment..."
cp .env .env.backup
cp .env.production .env

echo "🔨 Building APK locally using EAS CLI..."
npx eas build -p android --profile apk-mvp --local

# Restore original files
echo "🔄 Restoring original environment..."
cp .env.backup .env
rm .env.backup

echo "✅ Build process complete!"
echo "The SmartShala APK has been built locally and is available in the build output directory."
echo "You can directly transfer this APK to your device for testing."
