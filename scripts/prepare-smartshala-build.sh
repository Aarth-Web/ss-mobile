#!/bin/bash

# Script to prepare SmartShala for APK building with proper name and icon

# Exit if any command fails
set -e

echo "🚀 Preparing SmartShala for APK build..."

# Verify the app.config.js has the right name and settings
echo "📝 Verifying app.config.js settings..."
APP_NAME=$(node -e "console.log(require('./app.config.js').name)")
if [ "$APP_NAME" != "Smart Shala" ]; then
  echo "Updating app name in app.config.js..."
  sed -i '' 's/name: "ss-mobile",/name: "Smart Shala",/' app.config.js
fi

# Check Android package name
PACKAGE_NAME=$(node -e "console.log(require('./app.config.js').android?.package || '')")
if [ "$PACKAGE_NAME" != "com.adi77.smartshala" ]; then
  echo "Updating Android package name in app.config.js..."
  sed -i '' 's/package: "com.adi77.ssmobile",/package: "com.adi77.smartshala",/' app.config.js
fi

# Make sure icon settings are correct
if ! grep -q 'icon: "./assets/icon.png",' app.config.js; then
  echo "Adding icon setting to app.config.js..."
  sed -i '' 's/backgroundColor: "#ffffff"/backgroundColor: "#ffffff"\n    },\n    icon: ".\/assets\/icon.png"/' app.config.js
fi

# Update EAS.json to use the correct APK name
echo "📝 Updating EAS.json..."
if grep -q "artifactPath" eas.json; then
  echo "Updating deprecated artifactPath to applicationArchivePath..."
  sed -i '' 's/artifactPath/applicationArchivePath/' eas.json
fi

echo "✅ Configuration complete!"
echo ""
echo "Next Steps:"
echo "1. Run the following command to generate a keystore and build your APK:"
echo "   npx eas build -p android --profile apk-mvp"
echo ""
echo "2. When prompted:"
echo "   - Select 'Generate new keystore' if this is your first build"
echo ""
echo "3. After the build completes, download the APK from the EAS dashboard:"
echo "   https://expo.dev/accounts/adi77/projects/ss-mobile/builds"
echo ""
echo "4. The APK will install as 'Smart Shala' with the proper icon"
