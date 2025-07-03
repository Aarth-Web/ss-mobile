# MVP APK Build Guide for WhatsApp Distribution

This guide explains how to build an APK for distributing to test users via WhatsApp or other channels, specifically addressing the React 19 vs Lottie dependency conflict.

## The Core Issue

The project uses:
- React 19.0.0
- Lottie dependencies that require React ≤ 18.0.0

This creates a dependency conflict that prevents building with standard methods.

## Solution: Build Without Lottie

We've created a special build script that temporarily removes Lottie dependencies and uses a non-Lottie splash screen for the APK build.

## Building the APK

### Option 1: Using the No-Lottie build script (recommended)

```bash
./scripts/build-no-lottie-apk.sh
```

This script will:
1. Create a modified version of App.tsx that uses SplashNoLottie
2. Temporarily remove Lottie dependencies from package.json
3. Install dependencies without Lottie
4. Build the APK with EAS
5. Restore all original files

### Option 2: Manual build (if you prefer more control)

1. Temporarily comment out Lottie dependencies:
   ```bash
   # Edit package.json to remove Lottie dependencies
   # Comment out or remove these lines:
   # "@lottiefiles/dotlottie-react": "^0.6.5"
   # "lottie-react-native": "7.2.2"
   ```

2. Copy and replace the Splash screen with the non-Lottie version:
   ```bash
   cp app/screens/SplashNoLottie.tsx app/screens/Splash.tsx
   ```

3. Build the APK:
   ```bash
   npm run build:mvp-apk
   ```

4. Restore original files using Git:
   ```bash
   git checkout -- app/screens/Splash.tsx package.json
   ```

## Downloading the APK

1. After the build completes (which may take some time), you'll receive an email from Expo.
2. Visit the EAS dashboard: https://expo.dev/accounts/[YOUR_ACCOUNT]/projects/ss-mobile/builds
3. Find your latest build and click the download button to get the APK file.

## Distributing via WhatsApp

1. Transfer the APK to your phone (or directly download it on your phone).
2. Create a WhatsApp group with your test users.
3. Share the APK file by attaching it as a document in WhatsApp.
4. Include instructions for installation:
   - Users need to enable "Install from Unknown Sources" in their Android settings
   - The setting location varies by Android version, but generally:
     - Go to Settings > Security/Privacy > Install unknown apps
     - Select WhatsApp and enable "Allow from this source"
   - Download the APK from WhatsApp
   - Tap the downloaded file to install

## Notes for Test Users

Include these instructions when distributing your APK:

1. This is a test version of SmartShala for MVP testing.
2. The app is not from the Google Play Store, so you'll need to allow installation from unknown sources.
3. Your feedback is valuable - please report any issues or suggestions.

## Future Improvements

For the final production version, consider:
1. Downgrading React to version 18 to make it compatible with Lottie
2. Finding alternative animation libraries compatible with React 19
3. Forking and updating Lottie dependencies to support React 19
