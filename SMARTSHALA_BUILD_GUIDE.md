# Building SmartShala APK with Proper Name and Icon

This guide provides step-by-step instructions for building an APK for your app with the correct name ("Smart Shala"), proper icon, and distributable filename.

## Step 1: Prepare Your Configuration

Run the preparation script to set up all necessary configuration changes:

```bash
./scripts/prepare-smartshala-build.sh
```

This script will:

- Change the app name from "ss-mobile" to "Smart Shala"
- Update the Android package name to "com.adi77.smartshala"
- Configure both adaptive and regular icons
- Update EAS configuration to use the modern field names

## Step 2: Create a Non-Lottie Splash Screen (Optional)

If you're experiencing issues with Lottie dependencies:

1. Make sure you have the `SplashNoLottie.tsx` file in your app/screens directory
2. Edit App.tsx to use the non-Lottie version temporarily:
   ```javascript
   // Change this line
   import Splash from "./app/screens/Splash";
   // To this
   import Splash from "./app/screens/SplashNoLottie";
   ```

## Step 3: Build the APK

Run the EAS build command:

```bash
npx eas build -p android --profile apk-mvp
```

Follow the interactive prompts:

- When asked about credentials, select "Generate new keystore" if this is your first build
- This will create a proper Android keystore that will be stored on Expo servers

## Step 4: Download and Distribute the APK

1. Once the build is complete (you'll receive an email notification), go to:
   https://expo.dev/accounts/adi77/projects/ss-mobile/builds

2. Download the APK file

3. The app will now:
   - Have "Smart Shala" as its display name when installed
   - Use the proper icon from your assets folder
   - Be installable via WhatsApp or other distribution methods

## Icon Troubleshooting

If the icon still appears stretched or cut off:

1. **Check Icon Dimensions**:

   - Create a new icon with dimensions 1024x1024 pixels
   - Make sure the main content is centered with enough padding around it

2. **Icon Format Requirements**:

   - PNG format with transparency
   - No rounded corners (Android will apply masking automatically)
   - High resolution and clear even at small sizes

3. **Create Adaptive Icon**:
   - For adaptive-logo.png, ensure there's a 20% padding around all sides
   - The main content should be in the central 60% of the image

## APK Filename

While we've attempted to set a custom filename through EAS configuration, this feature may be experimental. If the downloaded APK doesn't have the desired name, you can simply rename it to `smartshala.apk` after downloading.

## Distribution Notes

When sharing the APK with test users:

1. Rename the file to `smartshala.apk` if needed
2. Send it via WhatsApp or other channels
3. Remind users to enable "Install from Unknown Sources" for WhatsApp in their settings
4. The app will install with the name "Smart Shala" and your proper icon
