import React, { useEffect, useState, useCallback } from "react";
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
  XCircleIcon,
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

export default function Students() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const { token, user, logout } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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

        // Filter only students (not teachers or other roles)
        const studentsList = data.users.filter(
          (user: StudentItem) => user.role === "student"
        );

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
            text: "OK",
            style: "cancel",
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

  // Focus listener to refresh students when returning to this screen
  useFocusEffect(
    React.useCallback(() => {
      // Reset to page 1 with no search when returning to screen
      setSearch("");
      setPage(1);
      setSearchLoading(false);

      // Fetch students when screen is focused
      const loadData = async () => {
        try {
          await fetchStudents({ resetPage: true, searchQuery: "" });
        } catch (error) {
          console.error("Error fetching students on screen focus:", error);
        }
      };

      loadData();

      // Cleanup function to clear any pending search timeouts
      return () => {
        if (searchTimeout) {
          clearTimeout(searchTimeout);
          setSearchTimeout(null);
        }
      };
    }, []) // Empty dependency array as we want this to run only on mount and focus
  );

  // Memoize fetchStudents to prevent unnecessary re-renders
  const memoizedFetchStudents = useCallback(
    (
      options: {
        showLoading?: boolean;
        resetPage?: boolean;
        searchQuery?: string;
        pageNumber?: number;
      } = {}
    ) => {
      fetchStudents(options);
    },
    [user, token, page, limit, search]
  );

  // Debounced search handler
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearch(text);

      // Clear any existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // If search is empty, reset to first page and load all students
      if (!text) {
        memoizedFetchStudents({ resetPage: true, searchQuery: "" });
        return;
      }

      // Show immediate visual feedback that search is processing
      setSearchLoading(true);

      // Set a new timeout for debouncing
      const timeout = setTimeout(() => {
        memoizedFetchStudents({ resetPage: true, searchQuery: text });
      }, 500); // 500ms debounce delay

      setSearchTimeout(timeout);
    },
    [searchTimeout, memoizedFetchStudents]
  );

  // Clear search handler with optimistic UI update
  const handleClearSearch = useCallback(() => {
    // Immediately update UI
    setSearch("");
    setSearchLoading(true);

    // Clear timeout if any
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Fetch all students
    fetchStudents({ resetPage: true, searchQuery: "" });
  }, [searchTimeout, fetchStudents]);

  // This is now handled in the memoized version above

  const renderItem = ({ item }: { item: StudentItem }) => (
    <TouchableOpacity
      className="w-full mb-4 rounded-xl overflow-hidden bg-white/5 border border-white/10"
      activeOpacity={0.7}
      onPress={() => {
        navigation.navigate("EditStudent", { studentId: item._id });
      }}
    >
      <View className="p-5">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-3">
            <Text className="text-base font-semibold text-white">
              {item.name}
            </Text>
            <Text className="text-xs text-slate-400 mt-0.5">
              {item.isActive ? "Active Student" : "Inactive Student"}
            </Text>
          </View>
          <View className="bg-purple-500/20 px-2.5 py-1 rounded-full">
            <Text className="text-purple-400 text-xs font-medium">
              ID: {item.registrationId || "N/A"}
            </Text>
          </View>
        </View>

        <View className="mt-3 pt-3 border-t border-white/5">
          <View className="flex-row items-center mt-1">
            <EnvelopeIcon size={14} color={THEME.text.secondary} />
            <Text className="text-slate-300 ml-1.5 text-sm" numberOfLines={1}>
              {item.email || "No email provided"}
            </Text>
          </View>

          <View className="flex-row items-center mt-2">
            <PhoneIcon size={14} color={THEME.text.secondary} />
            <Text className="text-slate-300 ml-1.5 text-sm">
              {item.mobile || "No phone number"}
            </Text>
          </View>
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
        <TouchableOpacity
          onPress={() => {
            // Navigate to Settings tab
            (navigation as any).navigate("Settings");
          }}
        >
          <UserCircleIcon size={34} color={THEME.text.primary} />
        </TouchableOpacity>
      </View>

      {/* 🔍 Search */}
      <View className="flex-row items-center bg-white/10 rounded-xl px-3 py-2.5 mb-4 border border-slate-700/50">
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

      {/* Students Heading with Count */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-semibold text-white">Students</Text>
        {totalStudents > 0 && (
          <Text className="text-slate-300 text-sm">
            {search ? "Found " : "Total "}
            {totalStudents} student{totalStudents !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      {/* 👨‍🎓 Students List */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text className="text-slate-300 mt-3">Loading students...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={students}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await fetchStudents({ showLoading: false, searchQuery: search });
              setRefreshing(false);
            }}
            ListEmptyComponent={() => (
              <View className="py-12 items-center">
                <View className="bg-purple-500/10 p-4 rounded-full mb-4">
                  <AcademicCapIcon size={32} color={THEME.text.secondary} />
                </View>
                <Text className="text-white text-lg font-medium text-center">
                  {search ? "No matching students found" : "No students found"}
                </Text>
                <Text className="text-slate-400 text-center mt-2 px-8">
                  {search
                    ? "Try a different search term or clear search to view all students"
                    : "Add your first student by tapping the button below"}
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
                        page === totalPages
                          ? "bg-slate-700/60"
                          : "bg-purple-600"
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
        </>
      )}

      {/* Add Student Button */}
      <TouchableOpacity
        className="absolute bottom-6 left-0 right-0 mx-5 bg-purple-600 rounded-xl py-3.5 items-center shadow-lg"
        style={{
          shadowColor: THEME.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 5,
        }}
        activeOpacity={0.8}
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
    </GradientBackground>
  );
}
