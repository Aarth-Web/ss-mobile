#!/bin/bash

# Script to build an APK for MVP testing

# Exit if any command fails
set -e

echo "🚀 Starting MVP APK build process..."

# Set production environment
echo "📝 Copying production environment..."
cp .env .env.backup
cp .env.production .env

# Install dependencies without Lottie
echo "📦 Installing dependencies without Lottie..."
npm install --no-save

# Run the build
echo "🔨 Building APK..."
npx eas build -p android --profile apk-mvp --non-interactive

# Restore original environment
echo "🔄 Restoring original environment..."
cp .env.backup .env
rm .env.backup

echo "✅ Build process complete!"
echo "The APK will be available for download from the EAS dashboard."
echo "You can find it at: https://expo.dev/accounts/YOUR_EXPO_ACCOUNT/projects/ss-mobile/builds"
echo "⚠️ Note: The build might take some time to complete. You'll receive an email when it's ready."
