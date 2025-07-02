import { View, StyleSheet, Image } from "react-native";
import LottieView from "lottie-react-native";
import { useEffect, useRef } from "react";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { GradientBackground, THEME } from "../components/UIComponents";

export default function Splash({
  onAnimationFinish,
}: {
  onAnimationFinish: () => void;
}) {
  const animation = useRef(null);
  const scaleAnim = useSharedValue(0.8);
  const opacityAnim = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
      opacity: opacityAnim.value,
    };
  });

  useEffect(() => {
    scaleAnim.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.exp),
    });
    opacityAnim.value = withTiming(1, { duration: 1000 });

    const timer = setTimeout(() => {
      onAnimationFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const AnimatedText = Animated.createAnimatedComponent(Animated.Text);

  return (
    <GradientBackground style={styles.container}>
      <View style={styles.topSection}>
        <Animated.Image
          style={styles.logo}
          entering={FadeInDown.delay(100).springify()}
          source={require("../../assets/adaptive-logo.png")}
          resizeMode="contain"
          className="text-white"
          tintColor={"#ffffff"}
        />
      </View>

      <View style={styles.middleSection}>
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <AnimatedText style={styles.welcomeSmallText}>
            WELCOME TO
          </AnimatedText>
          <AnimatedText style={styles.welcomeText}>SmartShala</AnimatedText>
        </Animated.View>

        <Animated.View style={[styles.lottieContainer, animatedStyle]}>
          <LottieView
            ref={animation}
            source={require("../../assets/lottie/student.json")}
            autoPlay
            loop={true}
            style={styles.lottie}
          />
        </Animated.View>
      </View>

      <View style={styles.bottomSection}>
        <Animated.View entering={FadeInDown.delay(800).springify()}>
          <AnimatedText style={styles.taglineText}>
            Empowering Education, One Class at a Time 🚀
          </AnimatedText>
        </Animated.View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 16,
  },
  topSection: {
    width: "100%",
    alignItems: "center",
    paddingTop: 40,
  },
  middleSection: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 40,
  },
  logo: {
    width: 48,
    height: 48,
    tintColor: "#ffffff",
  },
  lottieContainer: {
    marginVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  lottie: {
    width: 240,
    height: 200,
  },
  welcomeSmallText: {
    fontSize: 12,
    fontWeight: "600",
    color: THEME.text.secondary,
    textAlign: "center",
    letterSpacing: 2,
    marginBottom: 0,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "semibold",
    color: THEME.text.primary,
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "#00000040",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  taglineText: {
    fontSize: 18,
    fontWeight: "500",
    color: THEME.text.secondary,
    textAlign: "center",
    opacity: 0.85,
    marginTop: 10,
    maxWidth: "90%",
  },
});
