import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ArrowLeftIcon, UserPlusIcon } from "react-native-heroicons/outline";
import { GradientBackground, Button, THEME } from "../components/UIComponents";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { useAuth } from "../hooks/authContext";
import apiConfig from "../config/api";
import { createAuthFetchOptions, handleApiResponse } from "../utils/apiHelpers";

export default function AddStudent() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { token, user, logout } = useAuth();

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [parentLanguage, setParentLanguage] = useState("");
  const [parentOccupation, setParentOccupation] = useState("");

  // Validation errors
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to validate form
  const validateForm = () => {
    let isValid = true;

    // Name validation
    if (!name.trim()) {
      setNameError("Name is required");
      isValid = false;
    } else {
      setNameError("");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    } else {
      setEmailError("");
    }

    // Mobile validation
    if (!mobile.trim()) {
      setMobileError("Mobile number is required");
      isValid = false;
    } else if (mobile.trim().length < 10) {
      setMobileError("Please enter a valid mobile number");
      isValid = false;
    } else {
      setMobileError("");
    }

    return isValid;
  };

  // Function to handle onboard student
  const handleAddStudent = async () => {
    if (!validateForm()) {
      return;
    }

    // Check if user and school ID are available
    if (!user || !user.school) {
      Alert.alert(
        "Error",
        "School information not available. Please log out and log in again."
      );
      return;
    }

    // Validate that school ID is a valid MongoDB ID (24 hex characters)
    const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(user.school);
    if (!isValidMongoId) {
      Alert.alert(
        "Error",
        "School ID is not valid. Please log out and log in again."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare the payload
      const payload = {
        name: name.trim(),
        role: "student",
        schoolId: user?.school || "", // Use school ID from user context and ensure it's not undefined
        email: email.trim(),
        mobile: "+91" + mobile.trim(),
        parentLanguage: parentLanguage.trim() || "hindi", // Default value
        parentOccupation: parentOccupation.trim() || "Not specified", // Default value
      };

      // Make API call
      const response = await fetch(`${apiConfig.baseUrl}/auth/onboard`, {
        method: "POST",
        ...createAuthFetchOptions(token),
        body: JSON.stringify(payload),
      });

      const data = await handleApiResponse(response, logout);

      // Show success message
      Alert.alert(
        "Success",
        `Student ${name} has been added successfully. Registration ID: ${
          data.registrationId || "Generated"
        }`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      console.error("Error adding student:", err);
      Alert.alert(
        "Error",
        err.message || "Failed to add student. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GradientBackground style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingTop: 60 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <ArrowLeftIcon size={20} color="#fff" />
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Text className="text-xl font-semibold text-white ml-2">
                Add New Student
              </Text>
            </View>
          </View>

          {/* Form Fields */}
          <View className="mb-4">
            <Text className="text-white text-sm mb-2">Student Name</Text>
            <View
              className={`bg-white/10 rounded-xl p-3 border ${
                nameError ? "border-red-400" : "border-white/20"
              }`}
            >
              <TextInput
                className="text-white"
                placeholder="Enter student name"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (text.trim()) setNameError("");
                }}
              />
            </View>
            {nameError ? (
              <Text className="text-red-400 text-xs mt-1">{nameError}</Text>
            ) : null}
          </View>

          <View className="mb-4">
            <Text className="text-white text-sm mb-2">Email Address</Text>
            <View
              className={`bg-white/10 rounded-xl p-3 border ${
                emailError ? "border-red-400" : "border-white/20"
              }`}
            >
              <TextInput
                className="text-white"
                placeholder="Enter email address"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (text.trim()) setEmailError("");
                }}
              />
            </View>
            {emailError ? (
              <Text className="text-red-400 text-xs mt-1">{emailError}</Text>
            ) : null}
          </View>

          <View className="mb-4">
            <Text className="text-white text-sm mb-2">Mobile Number</Text>
            <View
              className={`bg-white/10 rounded-xl p-3 border ${
                mobileError ? "border-red-400" : "border-white/20"
              }`}
            >
              <TextInput
                className="text-white"
                placeholder="Enter mobile number"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={(text) => {
                  setMobile(text);
                  if (text.trim()) setMobileError("");
                }}
              />
            </View>
            {mobileError ? (
              <Text className="text-red-400 text-xs mt-1">{mobileError}</Text>
            ) : null}
          </View>

          <View className="mb-4">
            <Text className="text-white text-sm mb-2">
              Parent's Language (Optional)
            </Text>
            <View className="bg-white/10 rounded-xl p-3 border border-white/20">
              <TextInput
                className="text-white"
                placeholder="Enter parent's preferred language"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={parentLanguage}
                onChangeText={setParentLanguage}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-white text-sm mb-2">
              Parent's Occupation (Optional)
            </Text>
            <View className="bg-white/10 rounded-xl p-3 border border-white/20">
              <TextInput
                className="text-white"
                placeholder="Enter parent's occupation"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={parentOccupation}
                onChangeText={setParentOccupation}
              />
            </View>
          </View>

          {/* Submit Button */}
          <Button
            title={isSubmitting ? "Adding Student..." : "Add Student"}
            onPress={handleAddStudent}
            disabled={isSubmitting}
          />

          <View className="mb-10" />
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
