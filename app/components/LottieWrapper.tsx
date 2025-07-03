import React, { ReactNode } from "react";
import { View, Text } from "react-native";

// This component serves as a safe wrapper for Lottie animations
// It will conditionally render Lottie or a placeholder based on build config
// This helps with React 19 vs Lottie dependency conflicts

interface LottieWrapperProps {
  // The actual Lottie component to render when available
  lottieComponent?: ReactNode;
  // Fallback content to show when Lottie can't be used
  fallback?: ReactNode;
  // Style for the container
  style?: any;
}

// This component is a simple wrapper that will either render the Lottie animation
// or a fallback component depending on whether Lottie is available
const LottieWrapper: React.FC<LottieWrapperProps> = ({
  lottieComponent,
  fallback,
  style,
}) => {
  // If we have a Lottie component, try to render it
  if (lottieComponent) {
    try {
      return <View style={style}>{lottieComponent}</View>;
    } catch (error) {
      console.warn("Error rendering Lottie component:", error);
    }
  }

  // If Lottie fails or isn't provided, render the fallback
  return (
    <View style={style}>
      {fallback || (
        <View
          style={{
            padding: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>Loading...</Text>
        </View>
      )}
    </View>
  );
};

export default LottieWrapper;
