import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { ArrowLeftIcon, LockClosedIcon } from "react-native-heroicons/outline";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { useAuth } from "../hooks/authContext";
import {
  GradientBackground,
  StyledInput,
  Button,
  THEME,
} from "../components/UIComponents";
import apiConfig from "../config/api";
import { createAuthFetchOptions, handleApiResponse } from "../utils/apiHelpers";

export default function ResetPassword() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    // Validate current password
    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    // Validate new password
    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long";
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(`${apiConfig.baseUrl}/auth/reset-password`, {
        method: "POST",
        ...createAuthFetchOptions(token),
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await handleApiResponse(response, logout);

      Alert.alert("Success", "Password updated successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error("Password reset error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to reset password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}>
        {/* Header */}
        <View className="flex-row items-center px-5 pt-16 mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ArrowLeftIcon size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-white ml-4">
            Reset Password
          </Text>
        </View>

        <View className="px-5">
          {/* Security Icon */}
          <View className="items-center mb-8">
            <View className="bg-purple-500/30 p-6 rounded-full mb-4">
              <LockClosedIcon size={40} color={THEME.primary} />
            </View>
            <Text className="text-white text-lg text-center">
              Create a new password for your account
            </Text>
            <Text className="text-slate-400 text-sm text-center mt-1 max-w-xs">
              Your new password must be different from previous passwords and at
              least 8 characters long.
            </Text>
          </View>

          {/* Password Form */}
          <View className="bg-white/5 rounded-xl p-5 border border-white/10 mb-6">
            <StyledInput
              label="Current Password"
              placeholder="Enter your current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              error={errors.currentPassword}
              autoCapitalize="none"
            />

            <StyledInput
              label="New Password"
              placeholder="Enter your new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              error={errors.newPassword}
              autoCapitalize="none"
            />

            <StyledInput
              label="Confirm New Password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
              autoCapitalize="none"
            />
          </View>

          {/* Submit Button */}
          <Button
            title={isSubmitting ? "Updating Password..." : "Update Password"}
            onPress={handleResetPassword}
            disabled={isSubmitting}
          />

          {isSubmitting && (
            <ActivityIndicator
              size="large"
              color={THEME.primary}
              style={{ marginTop: 20 }}
            />
          )}
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
