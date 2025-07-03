import React, { useState } from "react";
import { View, Text, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../hooks/authContext";
import apiConfig from "../config/api";
import { createAuthFetchOptions } from "../utils/apiHelpers";
import {
  StyledInput,
  Button,
  GradientBackground,
  Heading,
  Subheading,
} from "../components/UIComponents";
import KeyboardAwareWrapper from "../components/KeyboardAwareWrapper";
import { EyeIcon, EyeSlashIcon } from "react-native-heroicons/outline";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Login() {
  const [registrationId, setRegistrationId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    registrationId?: string;
    password?: string;
  }>({});

  const { login } = useAuth();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!registrationId.trim())
      newErrors.registrationId = "Registration ID is required";
    if (!password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${apiConfig.baseUrl}/auth/login`, {
        method: "POST",
        ...createAuthFetchOptions(null),
        body: JSON.stringify({ registrationId, password }),
      });

      const data = await response.json();
      if (response.ok && data.access_token) {
        // Extract user data from the response
        const { access_token, user } = data;
        login(access_token, user);
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (err) {
      Alert.alert("Network Error", "Unable to connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAwareWrapper
        contentContainerStyle={{ padding: 24, justifyContent: "center" }}
      >
        <View style={{ marginBottom: 40, alignItems: "center" }}>
          <Animated.Image
            style={styles.logo}
            entering={FadeInDown.delay(100).springify()}
            source={require("../../assets/adaptive-logo.png")}
            resizeMode="contain"
            className="text-white mb-6"
            tintColor={"#ffffff"}
          />
          <Subheading text="Welcome back! Please login to continue." />
        </View>

        <StyledInput
          label="Registration ID"
          value={registrationId}
          onChangeText={(text) => {
            setRegistrationId(text);
            setErrors((e) => ({ ...e, registrationId: "" }));
          }}
          error={errors.registrationId}
          placeholder="e.g. R789A134"
        />

        <View style={{ position: "relative" }}>
          <StyledInput
            label="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors((e) => ({ ...e, password: "" }));
            }}
            error={errors.password}
            placeholder="Your password"
          />
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 bottom-7"
          >
            {showPassword ? (
              <EyeSlashIcon size={22} color="#cbd5e1" />
            ) : (
              <EyeIcon size={22} color="#cbd5e1" />
            )}
          </TouchableOpacity>
        </View>

        <Button
          title="Login"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
          style={{ marginTop: 16 }}
          loadingText="Logging in..."
        />
      </KeyboardAwareWrapper>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 48,
    height: 48,
    tintColor: "#ffffff",
  },
});
