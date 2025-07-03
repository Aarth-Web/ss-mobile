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
  XCircleIcon,
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
  const [search, setSearch] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Function to fetch students with search and pagination
  const fetchStudents = async (
    options: {
      showLoading?: boolean;
      resetPage?: boolean;
      searchQuery?: string;
      pageNumber?: number;
    } = {}
  ) => {
    const {
      showLoading = true,
      resetPage = false,
      searchQuery = search,
      pageNumber = resetPage ? 1 : page,
    } = options;

    // Set a request ID to track if this is the latest request
    const requestId = Date.now();

    try {
      // Set the appropriate loading state based on if it's a search or initial load
      if (showLoading) {
        searchQuery ? setSearchLoading(true) : setLoading(true);
      }

      // If resetting page due to new search
      if (resetPage) {
        setPage(1);
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

      // Build the query URL with pagination and optional search parameters
      let url = `${apiConfig.baseUrl}/users/school/${user.school}?page=${pageNumber}&limit=${limit}`;

      // Add search parameter if provided
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      // Handle network connection errors
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

      try {
        const response = await fetch(url, {
          ...createAuthFetchOptions(token),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle API response
        const data = await handleApiResponse(response, logout);

        // Filter only students (not teachers or other roles) and mark those already in class
        const studentsList = data.users
          .filter((user: any) => user.role === "student")
          .map((student: any) => ({
            ...student,
            inClass: currentStudentIds.includes(student._id),
          }));

        // Update state with pagination information
        setStudents(studentsList);
        setTotalStudents(data.total);
        setTotalPages(data.pages || Math.ceil(data.total / limit));
        setPage(data.page);
      } catch (fetchError: any) {
        if (fetchError.name === "AbortError") {
          console.log("Request timed out");
          Alert.alert(
            "Connection Error",
            "The request timed out. Please check your internet connection and try again."
          );
        } else {
          throw fetchError; // Re-throw to be caught by outer catch block
        }
      }
    } catch (err: any) {
      console.log("Error fetching students:", err);
      // Show an error alert if the error is not related to authentication
      // Authentication errors are handled by the handleApiResponse function
      if (!err.message?.includes("session has expired")) {
        Alert.alert("Error", err.message || "Failed to fetch students", [
          {
            text: "Retry",
            onPress: () => fetchStudents(options),
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => navigation.goBack(),
          },
        ]);
      }

      // If search failed, show empty results
      setStudents([]);
      setTotalStudents(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
      setSearchLoading(false);
      setRefreshing(false);
    }
  };

  // Load students on component mount
  useEffect(() => {
    fetchStudents();

    // Cleanup function to clear any pending search timeouts
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
        setSearchTimeout(null);
      }
    };
  }, [classroomId]);

  // Implement debounced search
  const handleSearchChange = (text: string) => {
    setSearch(text);

    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // If search is empty, reset to first page and load all students
    if (!text) {
      fetchStudents({ resetPage: true, searchQuery: "" });
      return;
    }

    // Show immediate visual feedback that search is processing
    setSearchLoading(true);

    // Set a new timeout for debouncing
    const timeout = setTimeout(() => {
      fetchStudents({ resetPage: true, searchQuery: text });
    }, 500); // 500ms debounce delay

    setSearchTimeout(timeout);
  };

  // Clear search handler with optimistic UI update
  const handleClearSearch = () => {
    // Immediately update UI
    setSearch("");
    setSearchLoading(true);

    // Clear timeout if any
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Fetch all students
    fetchStudents({ resetPage: true, searchQuery: "" });
  };

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

  if (loading && !refreshing) {
    return (
      <GradientBackground
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text className="text-white mt-4 text-lg font-medium">
          Loading students...
        </Text>
        <Text className="text-slate-400 text-center mt-2">
          Please wait while we fetch the student list
        </Text>
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
        <View className="flex-row items-center bg-white/10 rounded-xl px-3 py-2.5 mb-1 border border-slate-700/50">
          <MagnifyingGlassIcon size={20} color={THEME.text.secondary} />
          <TextInput
            className="ml-2 flex-1 text-base text-white"
            placeholder="Search by name, email, ID, or mobile"
            placeholderTextColor={THEME.text.secondary}
            value={search}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchLoading ? (
            <ActivityIndicator
              size="small"
              color={THEME.primary}
              style={{ marginRight: 8 }}
            />
          ) : search ? (
            <TouchableOpacity onPress={handleClearSearch} className="p-1">
              <XCircleIcon size={20} color={THEME.text.secondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Selected Count and Search Info */}
      <View className="px-5 mb-2 flex-row justify-between">
        <Text className="text-white">
          {selectedStudents.length} student
          {selectedStudents.length !== 1 ? "s" : ""} selected
        </Text>
        {totalStudents > 0 && (
          <Text className="text-slate-300 text-sm">
            {search ? "Found " : "Total "}
            {totalStudents} student{totalStudents !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      {/* Student List */}
      <FlatList
        data={students}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 0,
          paddingBottom: 80,
        }}
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await fetchStudents({ showLoading: false, searchQuery: search });
          setRefreshing(false);
        }}
        ListEmptyComponent={() => (
          <View className="py-8 items-center">
            <View className="bg-purple-500/10 p-4 rounded-full mb-4">
              <CheckCircleIcon size={28} color={THEME.text.secondary} />
            </View>
            <Text className="text-white text-lg font-medium text-center">
              {search ? "No matching students found" : "No students found"}
            </Text>
            <Text className="text-slate-400 text-center mt-2 px-8">
              {search
                ? "Try a different search term or clear search"
                : "There are no students available to add"}
            </Text>
            {search && (
              <TouchableOpacity
                onPress={handleClearSearch}
                className="bg-purple-600 px-5 py-2.5 rounded-lg mt-6"
              >
                <Text className="text-white font-medium">Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListFooterComponent={() =>
          totalPages > 1 ? (
            <View className="flex-col justify-center items-center py-6">
              <Text className="text-slate-300 mb-3">
                Page {page} of {totalPages} • Showing {students.length} of{" "}
                {totalStudents} students
              </Text>
              <View className="flex-row justify-center">
                <TouchableOpacity
                  disabled={page === 1}
                  onPress={() =>
                    fetchStudents({
                      pageNumber: page - 1,
                      searchQuery: search,
                    })
                  }
                  className={`px-4 py-2.5 mr-2 rounded-lg ${
                    page === 1 ? "bg-slate-700/60" : "bg-purple-600"
                  }`}
                  style={{
                    opacity: page === 1 ? 0.6 : 1,
                    minWidth: 100,
                    alignItems: "center",
                  }}
                >
                  <Text className="text-white font-medium">Previous</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={page === totalPages}
                  onPress={() =>
                    fetchStudents({
                      pageNumber: page + 1,
                      searchQuery: search,
                    })
                  }
                  className={`px-4 py-2.5 ml-2 rounded-lg ${
                    page === totalPages ? "bg-slate-700/60" : "bg-purple-600"
                  }`}
                  style={{
                    opacity: page === totalPages ? 0.6 : 1,
                    minWidth: 100,
                    alignItems: "center",
                  }}
                >
                  <Text className="text-white font-medium">Next</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        }
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
