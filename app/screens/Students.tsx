import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "react-native-heroicons/solid";
import { GradientBackground, Button, THEME } from "../components/UIComponents";
import { useAuth } from "../hooks/authContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import apiConfig from "../config/api";
import { handleApiResponse, createAuthFetchOptions } from "../utils/apiHelpers";

type StudentItem = {
  _id: string;
  name: string;
  registrationId: string;
  email: string;
  mobile: string;
  role: string;
  school: string;
  isActive: boolean;
};

const MOCK_USER = {
  name: "Ganu Singh Thakur",
  email: "ganuthakur@school.edu",
  mobile: "9876543210",
};

export default function Students() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [filtered, setFiltered] = useState<StudentItem[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { token, user, logout } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Function to fetch students
  const fetchStudents = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

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

      const response = await fetch(
        `${apiConfig.baseUrl}/users/school/${user?.school}`,
        createAuthFetchOptions(token)
      );

      const data = await handleApiResponse(response, logout);

      // Filter only students (not teachers or other roles)
      const studentsList = data.users.filter(
        (user: StudentItem) => user.role === "student"
      );
      setStudents(studentsList);
      setFiltered(studentsList);
    } catch (err: any) {
      console.log("Error fetching students:", err);
      // Show an error alert if the error is not related to authentication
      // Authentication errors are handled by the handleApiResponse function
      if (!err.message.includes("session has expired")) {
        Alert.alert("Error", err.message || "Failed to fetch students");
      }
    } finally {
      setLoading(false);
    }
  };

  // Focus listener to refresh students when returning to this screen
  useFocusEffect(
    React.useCallback(() => {
      fetchStudents();
    }, [token])
  );

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      students.filter(
        (student) =>
          student.name.toLowerCase().includes(q) ||
          student.registrationId.toLowerCase().includes(q)
      )
    );
  }, [search, students]);

  const renderItem = ({ item }: { item: StudentItem }) => (
    <TouchableOpacity
      className="w-full mb-4 rounded-xl overflow-hidden bg-white/5 border border-white/10"
      onPress={() => {
        navigation.navigate("EditStudent", { studentId: item._id });
      }}
    >
      <View className="p-4">
        <Text className="text-base font-semibold text-white">{item.name}</Text>
        <View className="flex-row items-center mt-1.5">
          <AcademicCapIcon size={14} color="#94a3b8" />
          <Text className="text-slate-300 ml-1.5 text-sm">
            ID: {item.registrationId}
          </Text>
        </View>

        <View className="flex-row items-center mt-1.5">
          <EnvelopeIcon size={14} color="#94a3b8" />
          <Text className="text-slate-300 ml-1.5 text-sm">{item.email}</Text>
        </View>

        <View className="flex-row items-center mt-1.5">
          <PhoneIcon size={14} color="#94a3b8" />
          <Text className="text-slate-300 ml-1.5 text-sm">{item.mobile}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <GradientBackground style={{ paddingTop: 60, paddingHorizontal: 20 }}>
      {/* 🔝 Topbar */}
      <View className="flex-row justify-between items-center mb-6">
        <View className="flex-row items-center">
          <Image
            source={require("../../assets/adaptive-logo.png")}
            style={{ width: 28, height: 28 }}
            resizeMode="contain"
            className="text-white"
            tintColor={"#ffffff"}
          />
          <Text className="text-lg text-white font-semibold ml-0.5">
            SmartShala
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <UserCircleIcon size={34} color={THEME.text.primary} />
        </TouchableOpacity>
      </View>

      {/* 🔍 Search */}
      <View className="flex-row items-center bg-gray-300 rounded-xl px-2 py-1 mb-4 border border-slate-700/50">
        <MagnifyingGlassIcon size={20} color="#94a3b8" />
        <TextInput
          className="ml-1 flex-1 text-base text-black "
          placeholder="Search students by name or ID"
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Students Heading */}
      <Text className="text-xl font-semibold text-white mb-4">Students</Text>

      {/* 👨‍🎓 Students List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text className="text-slate-300 mt-3">Loading students...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await fetchStudents();
            setRefreshing(false);
          }}
          ListEmptyComponent={() => (
            <View className="py-8 items-center">
              <Text className="text-slate-300 text-center">
                No students found
              </Text>
              <Text className="text-slate-400 text-center mt-1 text-sm">
                Add students to get started
              </Text>
            </View>
          )}
        />
      )}

      {/* Add Student Button */}
      <TouchableOpacity
        className="absolute bottom-6 left-0 right-0 mx-5 bg-purple-600 rounded-xl py-3 items-center"
        onPress={() => {
          navigation.navigate("AddStudent");
        }}
      >
        <View className="flex-row items-center">
          <Text className="text-white font-semibold text-base">
            + Add Student
          </Text>
        </View>
      </TouchableOpacity>

      {/* 👤 Modal - Same as Home screen for consistency */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center px-6">
          <View className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
            <View className="flex-row justify-center items-center mb-4">
              <Image
                source={require("../../assets/logo.png")}
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
              <Text className="text-xl font-bold text-white ml-2">
                Teacher Profile
              </Text>
            </View>
            <Text className="text-slate-300 mb-2 ">Name: {MOCK_USER.name}</Text>
            <Text className="text-slate-300 mb-2 ">
              Email: {MOCK_USER.email}
            </Text>
            <Text className="text-slate-300 mb-4 ">
              Mobile: {MOCK_USER.mobile}
            </Text>

            <Button
              title="Reset Password"
              onPress={() => {}}
              style={{ marginTop: 10 }}
            />
            <Button
              title="Logout"
              variant="secondary"
              onPress={() => {
                setShowModal(false);
                setTimeout(() => {
                  // Gives the modal time to close before logging out
                  logout();
                }, 300);
              }}
              style={{ marginTop: 10 }}
            />

            <TouchableOpacity
              onPress={() => setShowModal(false)}
              className="mt-4"
            >
              <Text className="text-center text-slate-400 ">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </GradientBackground>
  );
}
