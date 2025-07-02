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

  // Function to fetch attendance records
  const fetchAttendanceRecords = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await fetch(
        `${apiConfig.baseUrl}/attendance/classroom/${classroomId}`,
        createAuthFetchOptions(token)
      );

      const data = await handleApiResponse(response, logout);

      // Check if data has the expected structure
      if (!data || !data.data) {
        console.warn("Unexpected API response format:", data);
        setAttendanceData([]);
      } else {
        setAttendanceData(data.data || []);
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
    fetchAttendanceRecords();
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

        {item.smsSent && (
          <View className="bg-yellow-500/20 rounded-md px-2 py-1 self-start">
            <Text className="text-yellow-400 text-xs">SMS Sent</Text>
          </View>
        )}

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
        <Text className="text-slate-300">
          Showing all attendance records for this class
        </Text>
      </View>

      {/* Attendance Records List */}
      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={THEME.primary} />
          <Text className="text-white mt-4">Loading attendance records...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-white text-center mb-4">{error}</Text>
          <TouchableOpacity
            onPress={() => fetchAttendanceRecords()}
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
                fetchAttendanceRecords(false);
              }}
              tintColor={THEME.primary}
              colors={[THEME.primary]}
            />
          }
          ListEmptyComponent={() => (
            <View className="py-8 items-center">
              <Text className="text-slate-300 text-center">
                No attendance records found
              </Text>
              <Text className="text-slate-400 text-center mt-1 text-sm">
                Start taking attendance to see records here
              </Text>
            </View>
          )}
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
