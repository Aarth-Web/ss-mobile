# SmartShala APK Build Guide

This guide explains how to build a proper APK for SmartShala with the correct app name, icon, and file name.

## Changes Made

1. **Application Name**: Changed from "ss-mobile" to "Smart Shala"
2. **Package Name**: Changed from "com.adi77.ssmobile" to "com.adi77.smartshala"
3. **APK Filename**: Set to "smartshala.apk" instead of the default name
4. **Icon Display**: Added both adaptive icon and regular icon configurations

## Building the APK

Use the enhanced build script:

```bash
./scripts/build-smartshala-apk.sh
```

This script will:

1. Apply all the necessary configuration changes
2. Build the APK with the correct name and settings
3. Restore your original configurations after the build

## Troubleshooting Icon Issues

If the icon still appears stretched or not fully visible:

1. **Check Icon Dimensions**:

   - The adaptive icon should be 108×108 pixels at minimum (ideally 432×432)
   - The regular icon should be 1024×1024 pixels

2. **Ensure Proper Padding**:

   - Android adaptive icons need sufficient padding (about 20% on each side)
   - The main content should be in the center 60% of the image

3. **Generate New Icons**:
   If needed, you can generate proper icons using:
   - [Expo's Image Generator](https://www.npmjs.com/package/@expo/image-utils)
   - Or online tools like [App Icon Generator](https://appicon.co/)

## Using the Correct Icon Format

Create an icon with the following specifications:

1. PNG format with transparency
2. Square dimensions (1024×1024px for best quality)
3. For adaptive icons, ensure the main content is in the center 60%
4. Save it in your assets folder with proper naming

## After Building

1. After the build completes, download the APK from the EAS dashboard
2. Test the installation on a real device to verify the name and icon display correctly
3. If there are still issues with the icon, you may need to recreate it with proper dimensions and padding

## Distribution Steps

1. Share the APK via WhatsApp or other methods
2. The app will now install as "Smart Shala" instead of "ss-mobile"
3. Ensure users enable "Install from Unknown Sources" in their settings

## Notes

- The APK filename setting (artifactPath) is an experimental feature in EAS
- If the custom filename doesn't work, you can always manually rename the APK after downloading
