import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { ArrowLeftIcon, UserCircleIcon } from "react-native-heroicons/outline";
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

export default function EditProfile() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token, user, login, logout } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    mobile?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      mobile?: string;
    } = {};

    // Validate name
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate mobile (optional but if provided must be valid)
    if (mobile && !/^\+?[0-9]{10,15}$/.test(mobile)) {
      newErrors.mobile = "Please enter a valid mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(`${apiConfig.baseUrl}/users/profile`, {
        method: "PUT",
        ...createAuthFetchOptions(token),
        body: JSON.stringify({
          name,
          email,
          mobile,
        }),
      });

      const data = await handleApiResponse(response, logout);

      // Update the user in context
      if (user && data) {
        login(token as string, {
          ...user,
          name: data.name,
          email: data.email,
          mobile: data.mobile,
        });
      }

      Alert.alert("Success", "Profile updated successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error("Profile update error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to update profile. Please try again."
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
            Edit Profile
          </Text>
        </View>

        <View className="px-5">
          {/* Profile Icon */}
          <View className="items-center mb-8">
            <View className="bg-purple-500/30 p-6 rounded-full mb-4">
              <UserCircleIcon size={40} color={THEME.primary} />
            </View>
            <Text className="text-white text-lg text-center">
              Update Your Profile Information
            </Text>
            <Text className="text-slate-400 text-sm text-center mt-1 max-w-xs">
              Make changes to your profile details below
            </Text>
          </View>

          {/* Profile Form */}
          <View className="bg-white/5 rounded-xl p-5 border border-white/10 mb-6">
            <StyledInput
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              error={errors.name}
              autoCapitalize="words"
            />

            <StyledInput
              label="Email Address"
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <StyledInput
              label="Mobile Number"
              placeholder="Enter your mobile number"
              value={mobile}
              onChangeText={setMobile}
              error={errors.mobile}
              keyboardType="phone-pad"
            />
          </View>

          {/* Submit Button */}
          <Button
            title={isSubmitting ? "Updating Profile..." : "Update Profile"}
            onPress={handleUpdateProfile}
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
