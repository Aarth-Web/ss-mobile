import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import {
  ArrowLeftIcon,
  XCircleIcon,
  CheckIcon,
  BellAlertIcon,
} from "react-native-heroicons/outline";
import { GradientBackground, Button, THEME } from "../components/UIComponents";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "../types/navigation";
import { useAuth } from "../hooks/authContext";
import apiConfig from "../config/api";
import { createAuthFetchOptions, handleApiResponse } from "../utils/apiHelpers";

type AbsentStudent = {
  _id: string;
  name: string;
  registrationId: string;
  sendSms: boolean;
};

export default function ConfirmAbsentees() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "ConfirmAbsentees">>();
  const {
    classroomId,
    classroomName,
    date,
    absentStudentIds,
    absentStudents: initialAbsentees,
    totalStudents,
  } = route.params;
  const { token, logout } = useAuth();

  // Format date for display (e.g., "Monday, July 2, 2025")
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Initialize with all students selected for SMS by default
  const [absentStudents, setAbsentStudents] = useState<AbsentStudent[]>(
    initialAbsentees.map((student) => ({
      ...student,
      sendSms: true,
    }))
  );
  const [loading, setLoading] = useState(false);
  const [sendToAll, setSendToAll] = useState(true);

  // Toggle SMS setting for all students
  const toggleAllSms = (value: boolean) => {
    setSendToAll(value);
    setAbsentStudents(
      absentStudents.map((student) => ({ ...student, sendSms: value }))
    );
  };

  // Toggle SMS setting for individual student
  const toggleStudentSms = (studentId: string) => {
    const updatedStudents = absentStudents.map((student) =>
      student._id === studentId
        ? { ...student, sendSms: !student.sendSms }
        : student
    );

    setAbsentStudents(updatedStudents);

    // Update "sendToAll" state based on whether all students now have sendSms=true
    setSendToAll(updatedStudents.every((student) => student.sendSms));
  };

  // Submit attendance with SMS settings
  const handleSubmitAttendance = async () => {
    try {
      setLoading(true);

      // Students to send SMS to
      const smsStudentIds = absentStudents
        .filter((student) => student.sendSms)
        .map((student) => student._id);

      // Get all students from the classroom
      const classroomResponse = await fetch(
        `${apiConfig.baseUrl}/classrooms/${classroomId}`,
        createAuthFetchOptions(token)
      );

      const classroomData = await handleApiResponse(classroomResponse, logout);
      const allStudentIds = classroomData.students.map(
        (student: any) => student._id
      );

      // Create records array with all students (present or absent)
      const records = allStudentIds.map((studentId: string) => ({
        student: studentId,
        present: !absentStudentIds.includes(studentId),
      }));

      // Validate the records array
      if (!Array.isArray(records) || records.length === 0) {
        throw new Error("No student records found for attendance");
      }

      const response = await fetch(`${apiConfig.baseUrl}/attendance`, {
        method: "POST",
        ...createAuthFetchOptions(token),
        body: JSON.stringify({
          classroomId,
          date,
          records, // All students with present/absent status
          sendSmsTo: smsStudentIds, // Only send SMS to selected absent students
          sendSmsToAllAbsent: sendToAll, // Whether to send SMS to all absent students
        }),
      });

      await handleApiResponse(response, logout);

      Alert.alert(
        "Success",
        `Attendance marked successfully for ${classroomName}.\n${
          smsStudentIds.length > 0
            ? `SMS will be sent to parents of ${
                smsStudentIds.length
              } absent student${smsStudentIds.length > 1 ? "s" : ""}.`
            : "No SMS notifications will be sent."
        }`,
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to classroom details with refresh
              navigation.navigate("ClassroomDetails", {
                classId: classroomId,
                refresh: true,
              });
            },
          },
        ]
      );
    } catch (err: any) {
      console.error("Error marking attendance:", err);
      Alert.alert(
        "Error",
        err.message || "Failed to mark attendance. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderAbsentStudentItem = ({ item }: { item: AbsentStudent }) => {
    return (
      <View className="bg-red-600/20 rounded-lg p-4 mb-3 flex-row justify-between items-center border border-red-500/30">
        <View className="flex-1">
          <Text className="text-white font-medium">{item.name}</Text>
          <Text className="text-slate-300 text-sm">
            ID: {item.registrationId}
          </Text>
        </View>

        <View className="flex-row items-center ml-2">
          <Text className="mr-2 text-white">Send SMS</Text>
          <Switch
            trackColor={{ false: "#555", true: "#4ade80" }}
            thumbColor={item.sendSms ? "#fff" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => toggleStudentSms(item._id)}
            value={item.sendSms}
          />
        </View>
      </View>
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
          Review Absences
        </Text>
      </View>

      {/* Classroom & Date Info */}
      <View className="px-5 mb-6">
        <Text className="text-2xl font-bold text-white">{classroomName}</Text>
        <Text className="text-slate-300">{formattedDate}</Text>
      </View>

      {/* Attendance Summary */}
      <View className="flex-row justify-between px-5 mb-4 bg-indigo-500/20 py-3 mx-5 rounded-xl">
        <View className="flex-row items-center">
          <CheckIcon size={18} color="#4ade80" />
          <Text className="text-white ml-2">
            Present: {totalStudents - absentStudentIds.length}
          </Text>
        </View>
        <View className="flex-row items-center">
          <XCircleIcon size={18} color="#f87171" />
          <Text className="text-white ml-2">
            Absent: {absentStudentIds.length}
          </Text>
        </View>
      </View>

      {absentStudents.length > 0 ? (
        <>
          {/* SMS Toggle for All */}
          <View className="px-5 mb-4 flex-row items-center justify-between bg-yellow-600/20 py-3 rounded-xl mx-5">
            <View className="flex-row items-center">
              <BellAlertIcon size={20} color="#facc15" />
              <Text className="text-white ml-2 font-medium">
                Send SMS to all parents
              </Text>
            </View>
            <Switch
              trackColor={{ false: "#555", true: "#4ade80" }}
              thumbColor={sendToAll ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleAllSms}
              value={sendToAll}
            />
          </View>

          <Text className="px-5 text-slate-300 mb-4">
            Select which absent students' parents should receive SMS
            notifications:
          </Text>

          {/* Student List */}
          <FlatList
            data={absentStudents}
            renderItem={renderAbsentStudentItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 20, paddingTop: 0 }}
          />
        </>
      ) : (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-white text-center text-lg">
            All students are present today!
          </Text>
          <Text className="text-slate-300 text-center mt-2">
            No absences to report.
          </Text>
        </View>
      )}

      {/* Submit Button */}
      <View className="p-5 pt-2 bg-black/20 border-t border-white/10">
        {loading ? (
          <View className="py-3 items-center">
            <ActivityIndicator size="large" color={THEME.primary} />
            <Text className="text-white mt-2">Saving attendance...</Text>
          </View>
        ) : (
          <Button
            title={`Save Attendance${
              absentStudents.some((student) => student.sendSms)
                ? " & Send SMS"
                : ""
            }`}
            onPress={handleSubmitAttendance}
          />
        )}
      </View>
    </GradientBackground>
  );
}
