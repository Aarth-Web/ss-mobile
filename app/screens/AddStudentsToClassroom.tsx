import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
} from "react-native-heroicons/outline";
import { CheckCircleIcon as CheckCircleIconSolid } from "react-native-heroicons/solid";
import { GradientBackground, Button, THEME } from "../components/UIComponents";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../types/navigation";
import { useAuth } from "../hooks/authContext";
import apiConfig from "../config/api";
import { createAuthFetchOptions, handleApiResponse } from "../utils/apiHelpers";

type Student = {
  _id: string;
  name: string;
  registrationId: string;
  inClass?: boolean;
};

export default function AddStudentsToClassroom() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, "AddStudentsToClassroom">>();
  const { classroomId, currentStudentIds = [] } = route.params;
  const { token, user, logout } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Load all students from the school
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);

        // Check if user and school ID are available
        if (!user || !user.school) {
          Alert.alert(
            "Error",
            "School information not available. Please log out and log in again."
          );
          setLoading(false);
          return;
        }

        // Validate that school ID is a valid MongoDB ID (24 hex characters)
        const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(user.school);
        if (!isValidMongoId) {
          Alert.alert(
            "Error",
            "School ID is not valid. Please log out and log in again."
          );
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${apiConfig.baseUrl}/users/school/${user?.school}`,
          createAuthFetchOptions(token)
        );

        const data = await handleApiResponse(response, logout);

        // Filter only students (not teachers or other roles)
        const studentsList = data.users
          .filter((user: any) => user.role === "student")
          .map((student: any) => ({
            ...student,
            inClass: currentStudentIds.includes(student._id),
          }));

        setStudents(studentsList);
        setFilteredStudents(studentsList);
      } catch (err: any) {
        console.error("Error fetching students:", err);
        Alert.alert("Error", err.message || "Failed to load students");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token, classroomId]);

  // Filter students based on search
  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredStudents(
      students.filter(
        (student) =>
          student.name.toLowerCase().includes(q) ||
          student.registrationId.toLowerCase().includes(q)
      )
    );
  }, [search, students]);

  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      Alert.alert(
        "No Students Selected",
        "Please select at least one student to add to the classroom."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${apiConfig.baseUrl}/classrooms/${classroomId}/students`,
        {
          method: "POST",
          ...createAuthFetchOptions(token),
          body: JSON.stringify({ studentIds: selectedStudents }),
        }
      );

      await handleApiResponse(response, logout);

      Alert.alert(
        "Success",
        `${selectedStudents.length} student${
          selectedStudents.length > 1 ? "s" : ""
        } added to classroom successfully.`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(), // Go back to the previous screen
          },
        ]
      );
    } catch (err: any) {
      console.error("Error adding students to classroom:", err);
      Alert.alert(
        "Error",
        err.message || "Failed to add students to classroom"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStudentItem = ({ item }: { item: Student }) => {
    const isSelected = selectedStudents.includes(item._id);
    const isInClass = item.inClass;

    // If student is already in class, disable selection
    const disabled = isInClass;

    return (
      <TouchableOpacity
        className={`flex-row items-center justify-between p-4 mb-2 rounded-xl border ${
          isSelected
            ? "bg-purple-600/20 border-purple-500"
            : isInClass
            ? "bg-gray-600/30 border-gray-500"
            : "bg-white/5 border-white/10"
        }`}
        onPress={() => !disabled && toggleStudentSelection(item._id)}
        disabled={disabled}
      >
        <View className="flex-1">
          <Text className="text-white font-medium">{item.name}</Text>
          <Text className="text-slate-300 text-sm">
            ID: {item.registrationId}
          </Text>
        </View>

        <View className="ml-2">
          {isInClass ? (
            <Text className="text-gray-400 text-xs">Already in class</Text>
          ) : isSelected ? (
            <CheckCircleIconSolid size={24} color={THEME.primary} />
          ) : (
            <CheckCircleIcon size={24} color="white" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <GradientBackground
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text className="text-white mt-4">Loading students...</Text>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground style={{ flex: 1, paddingTop: 60 }}>
      {/* Header */}
      <View className="flex-row items-center px-5 mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ArrowLeftIcon size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-white ml-4">
          Add Students to Class
        </Text>
      </View>

      {/* Search Input */}
      <View className="px-5 mb-4">
        <View className="flex-row items-center bg-gray-300 rounded-xl px-2 py-1 mb-1 border border-slate-700/50">
          <MagnifyingGlassIcon size={20} color="#94a3b8" />
          <TextInput
            className="ml-1 flex-1 text-base text-black"
            placeholder="Search students by name or ID"
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Selected Count */}
      <View className="px-5 mb-2">
        <Text className="text-white">
          {selectedStudents.length} student
          {selectedStudents.length !== 1 ? "s" : ""} selected
        </Text>
      </View>

      {/* Student List */}
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        ListEmptyComponent={() => (
          <View className="py-8 items-center">
            <Text className="text-slate-300 text-center">
              No students found
            </Text>
          </View>
        )}
      />

      {/* Add Button */}
      <View className="p-5 pt-2">
        <Button
          title={submitting ? "Adding Students..." : "Add Selected Students"}
          onPress={handleAddStudents}
          disabled={submitting || selectedStudents.length === 0}
        />

        <Button
          title="Cancel"
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 10 }}
          disabled={submitting}
        />
      </View>
    </GradientBackground>
  );
}
