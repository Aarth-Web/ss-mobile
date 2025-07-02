import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
} from "react-native-heroicons/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
} from "react-native-heroicons/solid";
import { GradientBackground, Button, THEME } from "../components/UIComponents";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../types/navigation";
import { useAuth } from "../hooks/authContext";

type Student = {
  _id: string;
  name: string;
  registrationId: string;
  status: "present" | "absent";
};

export default function TakeAttendance() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "TakeAttendance">>();
  const {
    classroomId,
    classroomName,
    students: initialStudents,
    date = new Date().toISOString().split("T")[0],
  } = route.params;
  const { token } = useAuth();

  // Format date for display (e.g., "Monday, July 2, 2025")
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Initialize students with 'present' status by default
  const [students, setStudents] = useState<Student[]>(
    initialStudents.map((student) => ({
      ...student,
      status: "present",
    }))
  );
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if any student is absent for proceed button state
  const absentCount = students.filter(
    (student) => student.status === "absent"
  ).length;
  const presentCount = students.length - absentCount;

  // Update filtered students when search changes
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

  const toggleStudentStatus = (studentId: string) => {
    setStudents(
      students.map((student) =>
        student._id === studentId
          ? {
              ...student,
              status: student.status === "present" ? "absent" : "present",
            }
          : student
      )
    );
  };

  const handleAllPresent = () => {
    setStudents(students.map((student) => ({ ...student, status: "present" })));
  };

  const handleProceed = () => {
    const absentStudentIds = students
      .filter((student) => student.status === "absent")
      .map((student) => student._id);

    navigation.navigate("ConfirmAbsentees", {
      classroomId,
      classroomName,
      date,
      absentStudentIds,
      absentStudents: students.filter((student) => student.status === "absent"),
      totalStudents: students.length,
    });
  };

  const renderStudentItem = ({ item }: { item: Student }) => {
    const isPresent = item.status === "present";

    return (
      <TouchableOpacity
        className={`flex-row items-center justify-between p-4 mb-3 rounded-xl border ${
          isPresent
            ? "bg-green-600/20 border-green-500/50"
            : "bg-red-600/20 border-red-500/50"
        }`}
        onPress={() => toggleStudentStatus(item._id)}
      >
        <View className="flex-1">
          <Text className="text-white font-medium">{item.name}</Text>
          <Text className="text-slate-300 text-sm">
            ID: {item.registrationId}
          </Text>
        </View>

        <View className="flex-row items-center ml-2">
          <Text
            className={`mr-2 ${isPresent ? "text-green-400" : "text-red-400"}`}
          >
            {isPresent ? "Present" : "Absent"}
          </Text>
          {isPresent ? (
            <CheckCircleIconSolid size={24} color="#4ade80" />
          ) : (
            <XCircleIconSolid size={24} color="#f87171" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
          Attendance for {classroomName}
        </Text>
      </View>

      {/* Date Display */}
      <View className="flex-row items-center px-5 mb-4 bg-indigo-500/20 py-3 mx-5 rounded-xl">
        <CalendarIcon size={20} color="#a5b4fc" />
        <Text className="text-white ml-2 font-medium">{formattedDate}</Text>
      </View>

      {/* Search Input */}
      <View className="px-5 mb-2">
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

      {/* Stats & Quick Actions */}
      <View className="flex-row justify-between px-5 mb-4">
        <View className="flex-row items-center">
          <Text className="text-white mr-1">
            Present: {presentCount}/{students.length}
          </Text>
          <Text className="text-white ml-2 mr-1">
            Absent: {absentCount}/{students.length}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-white/10 px-3 py-1 rounded-lg"
          onPress={handleAllPresent}
        >
          <Text className="text-green-400">Mark All Present</Text>
        </TouchableOpacity>
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
              {search.trim()
                ? "No students found matching your search"
                : "No students in this class yet"}
            </Text>
          </View>
        )}
      />

      {/* Proceed Button */}
      <View className="p-5 pt-2 bg-black/20 border-t border-white/10">
        <Button
          title={loading ? "Processing..." : "Proceed to Review"}
          onPress={handleProceed}
          disabled={loading}
        />
      </View>
    </GradientBackground>
  );
}
