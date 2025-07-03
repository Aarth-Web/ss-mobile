# APK Building & Distribution Guide for MVP Testing

This guide explains how to build an APK for distributing to test users via WhatsApp or other channels.

## Prerequisites

- An Expo account
- The Expo CLI installed (`npm install -g expo-cli`)
- EAS CLI installed (`npm install -g eas-cli`)
- Authenticated with EAS (`eas login`)

## Building the APK

We've created a special build profile and script to help with the APK building process. This approach works around React 19 vs Lottie compatibility issues by conditionally rendering Lottie components.

### Option 1: Using the build script (recommended)

```bash
./scripts/build-mvp-apk.sh
```

This script will:

1. Back up your current environment
2. Set the production environment variables
3. Install dependencies
4. Build the APK with EAS
5. Restore your original environment

### Option 2: Manual steps

1. Set up the production environment:

   ```bash
   cp .env .env.backup
   cp .env.production .env
   ```

2. Build the APK:

   ```bash
   npm run build:mvp-apk
   ```

3. Restore your development environment:
   ```bash
   cp .env.backup .env
   rm .env.backup
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

## Troubleshooting

- If users see "App not installed" errors, make sure they've enabled installation from unknown sources.
- If the app crashes, collect logs if possible or have users describe exactly what they were doing.
- For lower-end devices, suggest users close other apps before running SmartShala.

---

Remember to collect feedback systematically from your test users to improve the app for future releases!
