#!/bin/bash

# Script to build an APK locally without using EAS cloud services

# Exit if any command fails
set -e

echo "🚀 Starting local SmartShala APK build process..."

# Set production environment
echo "📝 Copying production environment..."
cp .env .env.backup
cp .env.production .env

# Ensure the android directory exists and is set up
echo "🔧 Setting up Android build environment..."
npx expo prebuild -p android --no-install

# Try to find Android SDK location
if [ -d "$HOME/Library/Android/sdk" ]; then
  SDK_PATH="$HOME/Library/Android/sdk"
elif [ -d "/Applications/Android Studio.app/Contents/sdk" ]; then
  SDK_PATH="/Applications/Android Studio.app/Contents/sdk"
else
  echo "❌ Could not find Android SDK. Please specify in android/local.properties"
  echo "sdk.dir=/path/to/android/sdk" > android/local.properties
  exit 1
fi

# Create local.properties file with SDK path
echo "sdk.dir=$SDK_PATH" > android/local.properties

# Build the release APK
echo "🔨 Building release APK..."
cd android
./gradlew assembleRelease
cd ..

# Create dist directory and copy APK
echo "📦 Copying APK to dist directory..."
mkdir -p dist
cp android/app/build/outputs/apk/release/app-release.apk dist/smartshala.apk

# Restore original environment
echo "🔄 Restoring original environment..."
cp .env.backup .env
rm .env.backup

echo "✅ Build process complete!"
echo "The SmartShala APK has been built locally and is available at:"
echo "$(pwd)/dist/smartshala.apk"
echo "You can directly transfer this APK to your device for testing."
