import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "react-native-heroicons/outline";
import { THEME } from "../components/UIComponents";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../types/navigation";

// Define the structure we expect from the API for student records
type StudentRecord = {
  _id?: string;
  student: {
    id: string;
    name: string;
    registrationId: string;
  };
  present: boolean;
};

export default function AttendanceRecordDetails() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, "AttendanceRecordDetails">>();
  const { attendanceRecord, classroomName } = route.params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const renderStudentItem = ({ item }: { item: StudentRecord }) => (
    <View className="flex-row items-center justify-between py-3 px-2 border-b border-white/10">
      <View>
        <Text className="text-white font-medium">{item.student.name}</Text>
        <Text className="text-slate-400 text-xs">
          ID: {item.student.registrationId}
        </Text>
      </View>
      <View className="flex-row items-center">
        {item.present ? (
          <>
            <CheckCircleIcon size={18} color="#4ade80" />
            <Text className="text-green-400 ml-1">Present</Text>
          </>
        ) : (
          <>
            <XCircleIcon size={18} color="#f87171" />
            <Text className="text-red-400 ml-1">Absent</Text>
          </>
        )}
      </View>
    </View>
  );

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
          Attendance Details
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Class and Date Info */}
        <View className="px-5 mb-6">
          <Text className="text-2xl font-bold text-white">{classroomName}</Text>
          <View className="flex-row items-center mt-1">
            <CalendarIcon size={16} color={THEME.primary} />
            <Text className="text-white font-medium ml-2">
              {formatDate(attendanceRecord.date)}
            </Text>
          </View>
          <Text className="text-slate-400 text-sm mt-1">
            Recorded on: {formatTime(attendanceRecord.createdAt)}
          </Text>
        </View>

        {/* Statistics Card */}
        <View className="mx-5 bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <Text className="text-white font-semibold mb-3">Statistics</Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-300">Total Students</Text>
            <Text className="text-white font-medium">
              {attendanceRecord.statistics.totalStudents}
            </Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <View className="flex-row items-center">
              <CheckCircleIcon size={14} color="#4ade80" />
              <Text className="text-slate-300 ml-1">Present Students</Text>
            </View>
            <Text className="text-green-400 font-medium">
              {attendanceRecord.statistics.presentStudents}
            </Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <View className="flex-row items-center">
              <XCircleIcon size={14} color="#f87171" />
              <Text className="text-slate-300 ml-1">Absent Students</Text>
            </View>
            <Text className="text-red-400 font-medium">
              {attendanceRecord.statistics.absentStudents}
            </Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-300">Attendance Rate</Text>
            <Text className="text-blue-400 font-medium">
              {attendanceRecord.statistics.attendanceRate}%
            </Text>
          </View>

          {attendanceRecord.smsSent && (
            <View className="mt-3 pt-3 border-t border-white/10">
              <View className="bg-yellow-500/20 rounded-md px-3 py-1.5 self-start">
                <Text className="text-yellow-400 text-xs">
                  SMS sent to parents of absent students
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Students List */}
        <View className="mx-5">
          <Text className="text-white font-semibold mb-3">Student Records</Text>
          <FlatList
            data={attendanceRecord.records}
            renderItem={renderStudentItem}
            keyExtractor={(item, index) =>
              item._id || item.student.id || index.toString()
            }
            scrollEnabled={false}
            ListEmptyComponent={() => (
              <View className="py-8 items-center">
                <Text className="text-slate-300 text-center">
                  No student records available
                </Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
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
