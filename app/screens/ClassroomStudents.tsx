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
  TrashIcon,
  UserGroupIcon,
} from "react-native-heroicons/outline";
import { GradientBackground, THEME } from "../components/UIComponents";
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
};

export default function ClassroomStudents() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "ClassroomStudents">>();
  const {
    classroomId,
    classroomName,
    students: initialStudents,
  } = route.params;
  const { token, logout } = useAuth();

  // State
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [filteredStudents, setFilteredStudents] =
    useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Filter students based on search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredStudents(students);
      return;
    }

    const q = search.toLowerCase();
    setFilteredStudents(
      students.filter(
        (student) =>
          student.name.toLowerCase().includes(q) ||
          student.registrationId.toLowerCase().includes(q)
      )
    );
  }, [search, students]);

  const handleRemoveStudent = async (student: Student) => {
    Alert.alert(
      "Remove Student",
      `Are you sure you want to remove ${student.name} from this class?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              const response = await fetch(
                `${apiConfig.baseUrl}/classrooms/${classroomId}/students/${student._id}`,
                {
                  method: "DELETE",
                  ...createAuthFetchOptions(token),
                }
              );

              await handleApiResponse(response, logout);

              // Update local state
              setStudents((prev) => prev.filter((s) => s._id !== student._id));

              // Show success message
              Alert.alert(
                "Success",
                `Student ${student.name} has been removed from the class.`
              );
            } catch (err) {
              console.error("Error removing student:", err);
              Alert.alert(
                "Error",
                "Failed to remove student. Please try again."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderStudentItem = ({ item }: { item: Student }) => {
    return (
      <View className="bg-white/10 rounded-lg p-4 mb-3 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-white font-medium">{item.name}</Text>
          <Text className="text-slate-300 text-sm">
            ID: {item.registrationId}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handleRemoveStudent(item)}
          className="bg-red-500/20 p-2 rounded-full"
        >
          <TrashIcon size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <GradientBackground style={{ flex: 1, paddingTop: 60 }}>
      {/* Header */}
      <View className="flex-row items-center px-5 mb-4">
        <TouchableOpacity
          onPress={() => {
            // Navigate back and refresh classroom details
            navigation.navigate("ClassroomDetails", {
              classId: classroomId,
              refresh: true,
            });
          }}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ArrowLeftIcon size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-white ml-2">
          Students in Classroom
        </Text>
      </View>

      {/* Student Count */}
      <View className="px-5 mb-2 flex-row items-center">
        <UserGroupIcon size={18} color={THEME.secondary} />
        <Text className="text-slate-300 ml-2">
          {students.length} student{students.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Search Input */}
      <View className="px-5 mb-4">
        <View className="flex-row items-center bg-white/10 rounded-xl px-3 py-2 border border-white/20">
          <MagnifyingGlassIcon size={20} color="rgba(255,255,255,0.5)" />
          <TextInput
            className="ml-2 flex-1 text-base text-white"
            placeholder="Search students by name or ID"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Student List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={THEME.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          renderItem={renderStudentItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 20, paddingTop: 0 }}
          ListEmptyComponent={() => (
            <View className="py-8 items-center">
              <Text className="text-slate-300 text-center">
                {search.trim()
                  ? "No students found matching your search"
                  : "No students in this class yet"}
              </Text>
            </View>
          )}
        />
      )}
    </GradientBackground>
  );
}
