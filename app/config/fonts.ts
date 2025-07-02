// app/config/fonts.ts
import {
  useFonts,
  RedditSans_400Regular,
  RedditSans_500Medium,
  RedditSans_700Bold,
} from "@expo-google-fonts/reddit-sans";

export default function useAppFonts() {
  const [fontsLoaded] = useFonts({
    "RedditSans-Regular": RedditSans_400Regular,
    "RedditSans-Medium": RedditSans_500Medium,
    "RedditSans-Bold": RedditSans_700Bold,
  });

  return fontsLoaded;
}
