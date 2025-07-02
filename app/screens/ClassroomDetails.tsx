import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import {
  GradientBackground,
  Button,
  Card,
  THEME,
} from "../components/UIComponents";
import apiConfig from "../config/api";
import { handleApiResponse, createAuthFetchOptions } from "../utils/apiHelpers";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  UserGroupIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
} from "react-native-heroicons/outline";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../types/navigation";
import { useAuth } from "../hooks/authContext";

type ClassroomDetailsParams = {
  classId?: string;
  isNew?: boolean;
};

type Student = {
  _id: string;
  name: string;
  registrationId: string;
};

type Teacher = {
  _id: string;
  name: string;
  registrationId: string;
};

type School = {
  _id: string;
  name: string;
};

type ClassroomDetails = {
  _id: string;
  name: string;
  description: string;
  teacher: Teacher;
  students: Student[];
  school: School;
  created: string;
  updated: string;
};

export default function ClassroomDetails() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "ClassroomDetails">>();
  const { classId, isNew, isEdit, refresh } = route.params;
  const { token, user, logout } = useAuth();

  const [classroom, setClassroom] = useState<ClassroomDetails | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For creating/editing a class
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");

  // State for validation errors
  const [nameError, setNameError] = useState("");

  // Use the logged-in user's ID as the teacher ID

  // Function to validate form
  const validateForm = () => {
    let isValid = true;

    if (!className.trim()) {
      setNameError("Class name is required");
      isValid = false;
    } else {
      setNameError("");
    }

    return isValid;
  };

  // Function to create a new classroom
  const handleCreateClass = async () => {
    if (!className.trim()) return;

    try {
      setIsSubmitting(true);

      const response = await fetch(`${apiConfig.baseUrl}/classrooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          name: className.trim(),
          description: description.trim(),
          teacherId: user?._id, // Use logged-in user's ID as teacher ID
          schoolId: user?.school || "", // Get school ID from user context and ensure it's not undefined
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create classroom");
      }

      const createdClass = await response.json();

      // Refresh the classes list when returning to Home screen
      navigation.navigate("Tabs", { refresh: true });
    } catch (err) {
      console.error("Error creating classroom:", err);
      alert("Failed to create classroom. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Skip API call if we're creating a new class
    if (isNew) return;

    const fetchClassroomDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${apiConfig.baseUrl}/classrooms/${classId}`,
          createAuthFetchOptions(token)
        );

        const data = await handleApiResponse(response, logout);
        setClassroom(data);

        // If in edit mode, populate the form fields
        if (isEdit) {
          setClassName(data.name || "");
          setDescription(data.description || "");
        }
      } catch (err) {
        console.error("Error fetching classroom details:", err);
        setError("Could not load classroom details");
      } finally {
        setLoading(false);
      }
    };

    fetchClassroomDetails();
  }, [classId, token, isEdit, refresh]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Create or Edit class UI
  if (isNew || isEdit) {
    return (
      <GradientBackground
        style={{ paddingTop: 50, paddingHorizontal: 20, flex: 1 }}
      >
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ArrowLeftIcon size={20} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-white ml-4">
            {isNew ? "Create New Class" : "Edit Class"}
          </Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mb-4">
            <Text className="text-white text-sm mb-2">Class Name</Text>
            <View
              className={`bg-white/10 rounded-xl p-3 border ${
                nameError ? "border-red-400" : "border-white/20"
              }`}
            >
              <TextInput
                className="text-white"
                placeholder="Enter class name"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={className}
                onChangeText={(text) => {
                  setClassName(text);
                  if (text.trim()) setNameError("");
                }}
              />
            </View>
            {nameError ? (
              <Text className="text-red-400 text-xs mt-1">{nameError}</Text>
            ) : null}
          </View>

          <View className="mb-4">
            <Text className="text-white text-sm mb-2">Description</Text>
            <View className="bg-white/10 rounded-xl p-3 border border-white/20">
              <TextInput
                className="text-white"
                placeholder="Enter class description"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={{ height: 100, textAlignVertical: "top" }}
              />
            </View>
          </View>

          <Button
            title={
              isSubmitting
                ? isNew
                  ? "Creating..."
                  : "Updating..."
                : isNew
                ? "Create Class"
                : "Save Changes"
            }
            onPress={async () => {
              if (!validateForm()) {
                return;
              }

              // Check if user and school ID are available
              if (!user || !user._id) {
                Alert.alert(
                  "Error",
                  "User information not available. Please log out and log in again."
                );
                return;
              }

              if (!user.school) {
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

                if (isNew) {
                  // CREATE - POST request
                  const response = await fetch(
                    `${apiConfig.baseUrl}/classrooms`,
                    {
                      method: "POST",
                      ...createAuthFetchOptions(token),
                      body: JSON.stringify({
                        name: className.trim(),
                        description: description.trim(),
                        teacherId: user?._id, // Use logged-in user's ID as teacher ID
                        schoolId: user?.school || "", // Ensure schoolId is not undefined
                      }),
                    }
                  );

                  const createdClass = await handleApiResponse(
                    response,
                    logout
                  );

                  Alert.alert("Success", "Classroom created successfully", [
                    { text: "OK", onPress: () => navigation.navigate("Tabs") },
                  ]);
                } else {
                  // UPDATE - PATCH request
                  const response = await fetch(
                    `${apiConfig.baseUrl}/classrooms/${classId}`,
                    {
                      method: "PATCH",
                      ...createAuthFetchOptions(token),
                      body: JSON.stringify({
                        name: className.trim(),
                        description: description.trim(),
                      }),
                    }
                  );

                  const updatedClass = await handleApiResponse(
                    response,
                    logout
                  );

                  Alert.alert("Success", "Classroom updated successfully", [
                    {
                      text: "OK",
                      onPress: () =>
                        navigation.navigate("Tabs", { refresh: true }),
                    },
                  ]);
                }
              } catch (err) {
                console.error(
                  `Error ${isNew ? "creating" : "updating"} classroom:`,
                  err
                );
                Alert.alert(
                  "Error",
                  `Failed to ${
                    isNew ? "create" : "update"
                  } classroom. Please try again.`
                );
              } finally {
                setIsSubmitting(false);
              }
            }}
            disabled={isSubmitting || !className.trim()}
            style={{ marginTop: 20 }}
          />

          {isEdit && (
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={{ marginTop: 10, marginBottom: 20 }}
            />
          )}
        </ScrollView>
      </GradientBackground>
    );
  }

  // Loading state for existing class details
  if (loading) {
    return (
      <GradientBackground
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text className="text-white mt-4">Loading classroom details...</Text>
      </GradientBackground>
    );
  }

  // Error state
  if (error || !classroom) {
    return (
      <GradientBackground
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text className="text-white text-lg text-center">
          {error || "Classroom not found"}
        </Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20 }}
        />
      </GradientBackground>
    );
  }

  return (
    <GradientBackground style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
        {/* Header with back button and edit button */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity
            onPress={() => navigation.navigate("Tabs", { refresh: true })}
            className="flex-row items-center"
          >
            <ArrowLeftIcon size={20} color={THEME.text.primary} />
            <Text className="text-white ml-2">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white/10 rounded-full p-2"
            onPress={() => {
              // Navigate to edit mode with the same class ID
              navigation.navigate("ClassroomDetails", {
                classId: classroom._id,
                isEdit: true,
              });
            }}
          >
            <PencilSquareIcon size={20} color={THEME.primary} />
          </TouchableOpacity>
        </View>

        {/* Classroom Title */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-white">
            {classroom.name}
          </Text>
          <Text className="text-slate-300 mt-1">{classroom.description}</Text>
        </View>

        {/* School Info */}
        <Card>
          <View className="flex-row items-center mb-3">
            <BuildingLibraryIcon size={20} color={THEME.secondary} />
            <Text className="text-white font-semibold ml-2">School</Text>
          </View>
          <Text className="text-slate-300">{classroom.school.name}</Text>
        </Card>

        {/* Teacher Info */}
        <Card>
          <View className="flex-row items-center mb-3">
            <UserGroupIcon size={20} color={THEME.primary} />
            <Text className="text-white font-semibold ml-2">Teacher</Text>
          </View>
          <Text className="text-white">{classroom.teacher.name}</Text>
          <Text className="text-slate-400 text-sm">
            ID: {classroom.teacher.registrationId}
          </Text>
        </Card>

        {/* Students Section */}
        <Card>
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <UserGroupIcon size={20} color="#facc15" />
              <Text className="text-white font-semibold ml-2">Students</Text>
            </View>
          </View>

          <Text className="text-slate-300 mb-4">
            {classroom.students.length > 0
              ? `This classroom has ${classroom.students.length} student${
                  classroom.students.length > 1 ? "s" : ""
                }.`
              : "No students in this class yet."}
          </Text>

          <View className="flex-row space-x-2">
            {/* Add Students Button */}
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("AddStudentsToClassroom", {
                  classroomId: classroom._id,
                  currentStudentIds: classroom.students.map(
                    (student) => student._id
                  ),
                });
              }}
              className="flex-1 bg-green-500 rounded-xl p-3 flex-row items-center justify-center"
            >
              <PlusIcon size={16} color="#fff" />
              <Text className="text-white ml-1 font-medium">Add Students</Text>
            </TouchableOpacity>

            {/* View Students Button */}
            <TouchableOpacity
              onPress={() => {
                // Navigate to a new screen to view and manage students
                navigation.navigate("ClassroomStudents", {
                  classroomId: classroom._id,
                  classroomName: classroom.name,
                  students: classroom.students,
                });
              }}
              className="flex-1 bg-purple-600/80 rounded-xl p-3 flex-row items-center justify-center"
            >
              <UserGroupIcon size={16} color="#fff" />
              <Text className="text-white ml-1 font-medium">
                Manage Students
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Attendance Section */}
        <Card style={{ marginTop: 20 }}>
          <View className="flex-row items-center mb-3">
            <CalendarIcon size={20} color={THEME.primary} />
            <Text className="text-white font-semibold ml-2">Attendance</Text>
          </View>

          <View className="flex-row space-x-2 mb-2">
            {/* Add Attendance Button */}
            <TouchableOpacity
              onPress={() => {
                // Navigate to take attendance screen
                navigation.navigate("TakeAttendance", {
                  classroomId: classroom._id,
                  classroomName: classroom.name,
                  students: classroom.students,
                });
              }}
              className="flex-1 bg-blue-500 rounded-xl p-3 flex-row items-center justify-center"
            >
              <PlusIcon size={16} color="#fff" />
              <Text className="text-white ml-1 font-medium">
                Add Attendance
              </Text>
            </TouchableOpacity>

            {/* View Attendance Records Button */}
            <TouchableOpacity
              onPress={() => {
                // Navigate to view attendance records screen
                navigation.navigate("AttendanceRecords", {
                  classroomId: classroom._id,
                  classroomName: classroom.name,
                });
              }}
              className="flex-1 bg-indigo-500 rounded-xl p-3 flex-row items-center justify-center"
            >
              <ClockIcon size={16} color="#fff" />
              <Text className="text-white ml-1 font-medium">View Records</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Date Info */}
        <Card>
          <View className="flex-row justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <CalendarIcon size={16} color={THEME.text.secondary} />
                <Text className="text-slate-300 ml-1">Created</Text>
              </View>
              <Text className="text-white">
                {formatDate(classroom.created)}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <ClockIcon size={16} color={THEME.text.secondary} />
                <Text className="text-slate-300 ml-1">Last Updated</Text>
              </View>
              <Text className="text-white">
                {formatDate(classroom.updated)}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </GradientBackground>
  );
}
