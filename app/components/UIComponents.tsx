import React, { ReactNode } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from "react-native";

// Theme colors
export const THEME = {
  primary: "#8B5CF6", // Purple
  secondary: "#10B981", // Teal/Emerald
  tertiary: "#3B82F6", // Blue
  background: {
    start: "#1E293B", // Dark slate
    end: "#0F172A", // Darker slate
  },
  card: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "rgba(255, 255, 255, 0.15)",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#94A3B8",
    muted: "#64748B",
  },
  input: {
    background: "rgba(255, 255, 255, 0.08)",
    placeholder: "#94A3B8",
    text: "#FFFFFF",
    border: "rgba(255, 255, 255, 0.2)",
    focusBorder: "#8B5CF6",
  },
  button: {
    primary: "#8B5CF6", // Purple
    secondary: "#10B981", // Teal/Emerald
  },
  error: "#EF4444",
};

// Background
interface GradientBackgroundProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
}) => (
  <View
    style={{
      flex: 1,
      width: "100%",
      height: "100%",
      backgroundColor: THEME.background.end,
      ...(style as object),
    }}
  >
    {children}
  </View>
);

// Card Component
interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => (
  <View
    className="bg-white/10 rounded-xl border border-white/15 p-5 my-2.5 shadow-md"
    style={style}
  >
    {children}
  </View>
);

// Styled Input
interface StyledInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const StyledInput: React.FC<StyledInputProps> = ({
  label,
  error,
  containerStyle,
  ...props
}) => (
  <View className="mb-4" style={containerStyle}>
    <Text className="text-white mb-2 font-medium">{label}</Text>
    <TextInput
      className={`bg-white/10 border ${
        error ? "border-red-500" : "border-white/20"
      } rounded-lg text-white p-3 text-base`}
      placeholderTextColor={THEME.input.placeholder}
      {...props}
    />
    {error ? <Text className="text-red-500 mt-1 text-xs">{error}</Text> : null}
  </View>
);

// Button Component
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  style,
  textStyle,
  disabled = false,
  loading = false,
  loadingText = "Loading...",
}) => {
  const gradientColors =
    variant === "primary" ? THEME.button.primary : THEME.button.secondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className="rounded-lg overflow-hidden"
      style={style}
      activeOpacity={0.8}
    >
      <View
        style={{
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled || loading ? 0.6 : 1,
          backgroundColor:
            variant === "primary"
              ? THEME.button.primary
              : THEME.button.secondary,
          flexDirection: "row",
        }}
      >
        {loading ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                borderWidth: 2,
                borderColor: "white",
                borderTopColor: "transparent",
                marginRight: 8,
              }}
              className="animate-spin"
            />
            <Text
              className="text-white font-semibold text-base"
              style={textStyle}
            >
              {loadingText}
            </Text>
          </View>
        ) : (
          <Text
            className="text-white font-semibold text-base"
            style={textStyle}
          >
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Heading Component
interface HeadingProps {
  text: string;
  style?: TextStyle;
}

export const Heading: React.FC<HeadingProps> = ({ text, style }) => (
  <Text className="text-2xl font-bold text-white mb-4" style={style}>
    {text}
  </Text>
);

// Subheading Component
interface SubheadingProps {
  text: string;
  style?: TextStyle;
}

export const Subheading: React.FC<SubheadingProps> = ({ text, style }) => (
  <Text className="text-lg font-medium text-slate-300 mb-3" style={style}>
    {text}
  </Text>
);

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  // We're keeping some styles for components that need more complex styling or gradients
});
