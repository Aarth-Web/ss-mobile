import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
} from "react-native";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronRightIcon,
} from "react-native-heroicons/outline";
import { THEME } from "../components/UIComponents";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../types/navigation";
import { useAuth } from "../hooks/authContext";
import apiConfig from "../config/api";
import { createAuthFetchOptions, handleApiResponse } from "../utils/apiHelpers";

type AttendanceRecord = {
  _id: string;
  date: string;
  records: Array<{
    student: {
      id: string;
      name: string;
      registrationId: string;
    };
    present: boolean;
    _id?: string;
  }>;
  statistics: {
    totalStudents: number;
    presentStudents: number;
    absentStudents: number;
    attendanceRate: number;
  };
  smsSent: boolean;
  smsNotifiedStudents: string[];
  createdAt: string;
  updatedAt: string;
};

export default function AttendanceRecords() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "AttendanceRecords">>();
  const { classroomId, classroomName } = route.params;
  const { token, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // Function to fetch attendance records with pagination
  const fetchAttendanceRecords = async (
    options: {
      showLoading?: boolean;
      pageNumber?: number;
      resetPage?: boolean;
    } = {}
  ) => {
    const {
      showLoading = true,
      pageNumber = page,
      resetPage = false,
    } = options;

    try {
      if (showLoading) setLoading(true);
      setError(null);

      // If resetting to page 1 (like on refresh)
      if (resetPage) {
        setPage(1);
      }

      // Build URL with pagination parameters
      const url = `${
        apiConfig.baseUrl
      }/attendance/classroom/${classroomId}?page=${
        resetPage ? 1 : pageNumber
      }&limit=${limit}`;

      const response = await fetch(url, createAuthFetchOptions(token));

      const data = await handleApiResponse(response, logout);

      // Check if data has the expected structure
      if (!data || !data.data) {
        console.warn("Unexpected API response format:", data);
        setAttendanceData([]);
        setTotalPages(0);
        setTotalRecords(0);
      } else {
        // Check if we have records
        if (!data.data || (data.data.length === 0 && page > 1)) {
          fetchAttendanceRecords({ pageNumber: 1, showLoading });
          return;
        }

        setAttendanceData(data.data || []);

        // Update pagination metadata
        if (data.meta) {
          setTotalPages(
            data.meta.totalPages || Math.ceil(data.meta.total / limit)
          );
          setTotalRecords(data.meta.total || 0);
          setPage(data.meta.page || pageNumber);
        } else {
          // Handle case where meta is missing but we have data
          const dataLength = data.data.length;
          setTotalRecords(dataLength);
          setTotalPages(dataLength > 0 ? 1 : 0);
          setPage(1);
        }
      }
    } catch (err: any) {
      console.error("Error fetching attendance records:", err);
      setError(err.message || "Failed to load attendance records");
      Alert.alert(
        "Error",
        err.message || "Failed to load attendance records. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch attendance data on component mount
  useEffect(() => {
    fetchAttendanceRecords({ resetPage: true });
  }, [classroomId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render attendance record item
  const renderAttendanceItem = ({ item }: { item: AttendanceRecord }) => {
    const attendanceDate = formatDate(item.date);
    const recordedTime = formatTime(item.createdAt);

    return (
      <TouchableOpacity
        className="bg-white/5 rounded-xl p-4 mb-3 border border-white/10"
        onPress={() => {
          // Navigate directly using the existing record data
          navigation.navigate("AttendanceRecordDetails", {
            attendanceRecord: item,
            classroomName: classroomName,
          });
        }}
      >
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <CalendarIcon size={16} color={THEME.primary} />
            <Text className="text-white font-semibold ml-2">
              {attendanceDate}
            </Text>
          </View>
          <Text className="text-slate-400 text-xs">{recordedTime}</Text>
        </View>

        {item.statistics ? (
          <View className="flex-row justify-between mb-3">
            <View className="flex-row items-center">
              <CheckCircleIcon size={14} color="#4ade80" />
              <Text className="text-green-400 ml-1 text-sm">
                {item.statistics.presentStudents} Present
              </Text>
            </View>
            <View className="flex-row items-center">
              <XCircleIcon size={14} color="#f87171" />
              <Text className="text-red-400 ml-1 text-sm">
                {item.statistics.absentStudents} Absent
              </Text>
            </View>
            <Text className="text-blue-400 text-sm font-medium">
              {item.statistics.attendanceRate}%
            </Text>
          </View>
        ) : (
          <View className="mb-3">
            <Text className="text-slate-400 text-sm">
              Statistics not available
            </Text>
          </View>
        )}

        <View className="bg-yellow-500/20 rounded-md px-2 py-1 self-start">
          <Text
            className={`${
              item.smsSent ? "text-yellow-400" : "text-gray-300"
            } text-xs`}
          >
            {item.smsSent ? "SMS Sent" : "No SMS sent"}
          </Text>
        </View>

        {/* Right arrow */}
        <View className="absolute right-3 bottom-4">
          <ChevronRightIcon size={20} color={THEME.text.secondary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View className="flex-row items-center px-5 mb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ArrowLeftIcon size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-white ml-4">
          Attendance Records
        </Text>
      </View>

      {/* Classroom Name */}
      <View className="px-5 mb-6">
        <Text className="text-2xl font-bold text-white">{classroomName}</Text>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-slate-300">
            {totalRecords > 0
              ? `${totalRecords} attendance record${
                  totalRecords !== 1 ? "s" : ""
                }`
              : "No attendance records yet"}
          </Text>
          {totalPages > 1 && (
            <Text className="text-slate-400 text-xs">
              Page {page} of {totalPages}
            </Text>
          )}
        </View>
      </View>

      {/* Attendance Records List */}
      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center px-5">
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text className="text-white mt-4 text-lg font-medium">
            Loading attendance records...
          </Text>
          <Text className="text-slate-400 text-center mt-2">
            {page === 1
              ? "Fetching the most recent attendance records"
              : `Loading page ${page} of attendance records`}
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-white text-center mb-4">{error}</Text>
          <TouchableOpacity
            onPress={() => fetchAttendanceRecords({ resetPage: true })}
            className="bg-purple-600 px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={attendanceData}
          renderItem={renderAttendanceItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 20, paddingTop: 0 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchAttendanceRecords({ showLoading: false, resetPage: true });
              }}
              tintColor={THEME.primary}
              colors={[THEME.primary]}
            />
          }
          ListEmptyComponent={() => (
            <View className="py-8 items-center">
              <View className="bg-purple-500/10 p-4 rounded-full mb-4">
                <CalendarIcon size={32} color={THEME.text.secondary} />
              </View>
              <Text className="text-white text-lg font-medium text-center">
                No attendance records found
              </Text>
              <Text className="text-slate-400 text-center mt-2 px-8">
                Start taking attendance to see records here
              </Text>
            </View>
          )}
          ListFooterComponent={() =>
            totalPages > 1 ? (
              <View className="flex-col justify-center items-center py-6">
                <Text className="text-slate-300 mb-3">
                  Page {page} of {totalPages} • Showing {attendanceData.length}{" "}
                  of {totalRecords} records
                </Text>
                <View className="flex-row justify-center">
                  <TouchableOpacity
                    disabled={page === 1}
                    onPress={() =>
                      fetchAttendanceRecords({
                        pageNumber: page - 1,
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
                      fetchAttendanceRecords({
                        pageNumber: page + 1,
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: THEME.background.end,
  },
});
