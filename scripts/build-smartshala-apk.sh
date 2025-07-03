#!/bin/bash

# Script to build an MVP APK with proper app name and icon

# Exit if any command fails
set -e

echo "🚀 Starting SmartShala MVP APK build process..."

# Set production environment
echo "📝 Copying production environment..."
cp .env .env.backup
cp .env.production .env

# Create a temporary App.tsx file that uses SplashNoLottie
echo "🔧 Creating modified App.tsx for the build..."
cp App.tsx App.tsx.backup
sed -i '' 's/import Splash from "\.\/app\/screens\/Splash";/import Splash from "\.\/app\/screens\/SplashNoLottie";/' App.tsx

# Create a simplified package.json for the build
echo "🔧 Creating simplified package.json without Lottie dependencies..."
cp package.json package.json.backup

# Use node to modify package.json properly
node -e '
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

// Remove Lottie from dependencies if present
if (pkg.dependencies && pkg.dependencies["@lottiefiles/dotlottie-react"]) {
  delete pkg.dependencies["@lottiefiles/dotlottie-react"];
}
if (pkg.dependencies && pkg.dependencies["lottie-react-native"]) {
  delete pkg.dependencies["lottie-react-native"];
}

// Remove Lottie from devDependencies if present
if (pkg.devDependencies && pkg.devDependencies["@lottiefiles/dotlottie-react"]) {
  delete pkg.devDependencies["@lottiefiles/dotlottie-react"];
}
if (pkg.devDependencies && pkg.devDependencies["lottie-react-native"]) {
  delete pkg.devDependencies["lottie-react-native"];
}

// Write the modified package.json
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
'

# Install dependencies
echo "📦 Installing dependencies..."
npm install --no-save

# Run the build
echo "🔨 Building APK..."
npx eas build -p android --profile apk-mvp --non-interactive

# Restore original files
echo "🔄 Restoring original files..."
cp .env.backup .env
rm .env.backup

# Restore App.tsx and package.json
cp App.tsx.backup App.tsx
cp package.json.backup package.json
rm App.tsx.backup package.json.backup

echo "✅ Build process complete!"
echo "The SmartShala APK will be available for download from the EAS dashboard."
echo "You can find it at: https://expo.dev/accounts/adi77/projects/smartshala/builds"
echo "⚠️ Note: The build might take some time to complete. You'll receive an email when it's ready."
