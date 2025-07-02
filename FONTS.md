# Adding Custom Fonts to the Project

This project uses the following custom fonts:

1. Reddit Sans
2. Caveat
3. Shadows Into Light

## Manual Font Installation

1. Download the fonts from these sources:

   - Reddit Sans: https://www.redditinc.com/brand#typography
   - Caveat: https://fonts.google.com/specimen/Caveat
   - Shadows Into Light: https://fonts.google.com/specimen/Shadows+Into+Light

2. Extract the downloaded files and place the TTF font files into the `assets/fonts` directory with these exact filenames:

   - `RedditSans-Regular.ttf`
   - `RedditSans-Medium.ttf`
   - `RedditSans-Bold.ttf`
   - `Caveat-Regular.ttf`
   - `Caveat-Medium.ttf`
   - `Caveat-Bold.ttf`
   - `ShadowsIntoLight-Regular.ttf`

3. If the font files you downloaded have different names, rename them to match the names above.

## Usage in the App

Fonts are loaded automatically when the app starts. You can use them in your NativeWind/Tailwind CSS styles:

```tsx
<Text className="font-reddit-sans">This uses Reddit Sans Regular</Text>
<Text className="font-reddit-sans-medium">This uses Reddit Sans Medium</Text>
<Text className="font-reddit-sans-bold">This uses Reddit Sans Bold</Text>
<Text className="font-caveat">This uses Caveat Regular</Text>
<Text className="font-caveat-medium">This uses Caveat Medium</Text>
<Text className="font-caveat-bold">This uses Caveat Bold</Text>
<Text className="font-shadows">This uses Shadows Into Light</Text>
```
