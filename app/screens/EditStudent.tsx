import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ArrowLeftIcon, UserIcon } from "react-native-heroicons/outline";
import { GradientBackground, Button, THEME } from "../components/UIComponents";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../types/navigation";
import { useAuth } from "../hooks/authContext";
import apiConfig from "../config/api";
import { createAuthFetchOptions, handleApiResponse } from "../utils/apiHelpers";

type ParentLanguage =
  | "english"
  | "hindi"
  | "marathi"
  | "tamil"
  | "telugu"
  | "kannada"
  | "malayalam"
  | "gujarati"
  | "bengali"
  | "punjabi"
  | "urdu"
  | "odia";

const parentLanguageOptions: ParentLanguage[] = [
  "english",
  "hindi",
  "marathi",
  "tamil",
  "telugu",
  "kannada",
  "malayalam",
  "gujarati",
  "bengali",
  "punjabi",
  "urdu",
  "odia",
];

export default function EditStudent() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "EditStudent">>();
  const { studentId } = route.params;
  const { token, logout } = useAuth();

  // Student data state
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [parentLanguage, setParentLanguage] = useState<ParentLanguage | "">("");
  const [parentOccupation, setParentOccupation] = useState("");

  // Validation errors
  const [nameError, setNameError] = useState("");
  const [mobileError, setMobileError] = useState("");

  useEffect(() => {
    // Fetch student data
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${apiConfig.baseUrl}/users/${studentId}`,
          createAuthFetchOptions(token)
        );

        const data = await handleApiResponse(response, logout);
        setStudentData(data);

        // Populate form fields
        setName(data.name || "");
        setMobile(data.mobile ? data.mobile.replace("+91", "") : "");
        setParentLanguage(data?.additionalInfo?.parentLanguage || "");
        setParentOccupation(data?.additionalInfo?.parentOccupation || "");
      } catch (err: any) {
        console.error("Error fetching student data:", err);
        Alert.alert(
          "Error",
          err.message || "Failed to load student data. Please try again."
        );
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId, token]);

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

    // Mobile validation
    if (!mobile.trim()) {
      setMobileError("Mobile number is required");
      isValid = false;
    } else if (mobile.trim().length < 10) {
      setMobileError("Please enter a valid 10-digit mobile number");
      isValid = false;
    } else {
      setMobileError("");
    }

    return isValid;
  };

  // Function to handle update student
  const handleUpdateStudent = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare the payload with only editable fields
      const payload: any = {};

      // Only include fields that have changed
      if (name !== studentData.name) {
        payload.name = name.trim();
      }

      if (mobile !== studentData.mobile.replace("+91", "")) {
        payload.mobile = "+91" + mobile.trim();
      }

      if (parentLanguage !== studentData.parentLanguage) {
        payload.parentLanguage = parentLanguage || undefined;
      }

      if (parentOccupation !== studentData.parentOccupation) {
        payload.parentOccupation = parentOccupation.trim() || undefined;
      }

      // If nothing changed, show message and return
      if (Object.keys(payload).length === 0) {
        Alert.alert("No Changes", "No changes were made to the student data.");
        navigation.goBack();
        return;
      }

      // Make API call
      const response = await fetch(`${apiConfig.baseUrl}/users/${studentId}`, {
        method: "PATCH",
        ...createAuthFetchOptions(token),
        body: JSON.stringify(payload),
      });

      await handleApiResponse(response, logout);

      // Show success message
      Alert.alert("Success", `Student ${name} has been updated successfully.`, [
        {
          text: "OK",
          onPress: () => {
            // Navigate back to the Students tab with refresh parameter
            navigation.goBack();
          },
        },
      ]);
    } catch (err: any) {
      console.error("Error updating student:", err);

      // Handle specific error cases
      if (err.message?.includes("forbidden") || err.message?.includes("403")) {
        Alert.alert(
          "Permission Denied",
          "You can only update students in your school."
        );
      } else if (
        err.message?.includes("not found") ||
        err.message?.includes("404")
      ) {
        Alert.alert("Not Found", "The student record could not be found.");
      } else {
        Alert.alert(
          "Error",
          err.message || "Failed to update student. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <GradientBackground
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text className="text-white mt-4">Loading student data...</Text>
      </GradientBackground>
    );
  }

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
            <View className="flex-row items-center ml-4">
              <Text className="text-xl font-semibold text-white ml-2">
                Edit Student
              </Text>
            </View>
          </View>

          {/* Student ID Display */}
          <View className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <Text className="text-slate-300 text-sm">Student ID</Text>
            <Text className="text-white font-medium mt-1">
              {studentData?.registrationId}
            </Text>
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
            <Text className="text-white text-sm mb-2">Mobile Number</Text>
            <View
              className={`bg-white/10 rounded-xl p-3 border ${
                mobileError ? "border-red-400" : "border-white/20"
              }`}
            >
              <View className="flex-row items-center">
                <Text className="text-white mr-2">+91</Text>
                <TextInput
                  className="text-white flex-1"
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
            </View>
            {mobileError ? (
              <Text className="text-red-400 text-xs mt-1">{mobileError}</Text>
            ) : null}
          </View>

          <View className="mb-4">
            <Text className="text-white text-sm mb-2">Parent's Language</Text>
            <View className="bg-white/10 rounded-xl px-2 py-1 border border-white/20">
              <Picker
                selectedValue={parentLanguage}
                onValueChange={(itemValue: string) =>
                  setParentLanguage(itemValue as ParentLanguage)
                }
                dropdownIconColor="white"
                style={{ color: "white" }}
              >
                <Picker.Item label="Select a language" value="" />
                {parentLanguageOptions.map((language) => (
                  <Picker.Item
                    key={language}
                    label={language.charAt(0).toUpperCase() + language.slice(1)}
                    value={language}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-white text-sm mb-2">Parent's Occupation</Text>
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

          {/* Action Buttons */}
          <Button
            title={isSubmitting ? "Updating Student..." : "Update Student"}
            onPress={handleUpdateStudent}
            disabled={isSubmitting}
          />

          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 10, marginBottom: 40 }}
            disabled={isSubmitting}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
