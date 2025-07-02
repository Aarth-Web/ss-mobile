import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  ArrowRightIcon,
} from "react-native-heroicons/solid";
import { GradientBackground, Button, THEME } from "../components/UIComponents";
import { useAuth } from "../hooks/authContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import apiConfig from "../config/api";
import { handleApiResponse, createAuthFetchOptions } from "../utils/apiHelpers";

type ClassItem = {
  _id: string;
  name: string;
  description: string;
  students: string[];
  school: { name: string };
};

export default function Home() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [filtered, setFiltered] = useState<ClassItem[]>([]);
  const [search, setSearch] = useState("");
  const { token, user, logout } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch classes
  const fetchClasses = async () => {
    try {
      const res = await fetch(
        `${apiConfig.baseUrl}/classrooms`,
        createAuthFetchOptions(token)
      );

      const data = await handleApiResponse(res, logout);
      setClasses(data);
      setFiltered(data);
    } catch (err: any) {
      console.log("Error fetching classes:", err);

      // Show an error alert if the error is not related to authentication
      if (!err.message.includes("session has expired")) {
        Alert.alert("Error", err.message || "Failed to fetch classes");
      }
    }
  };

  // Focus listener to refresh classes when returning from create class screen
  useFocusEffect(
    React.useCallback(() => {
      fetchClasses();
    }, [token])
  );

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(classes.filter((cls) => cls.name.toLowerCase().includes(q)));
  }, [search]);

  const renderItem = ({ item }: { item: ClassItem }) => (
    <TouchableOpacity
      className="w-full mb-4 rounded-xl overflow-hidden bg-white/5 border border-white/10"
      onPress={() => {
        navigation.navigate("ClassroomDetails", { classId: item._id });
      }}
    >
      <View className="p-4">
        <Text className="text-base font-semibold text-white">{item.name}</Text>
        <Text className="text-slate-300 mb-2 text-xs">{item.description}</Text>

        <View className="flex-row items-center mt-2">
          <UsersIcon size={18} color="#facc15" />
          <Text className="text-slate-300 ml-2 ">
            {item.students.length} students
          </Text>
        </View>

        {/* Right arrow positioned at bottom right */}
        <View className="absolute bottom-3 right-3">
          <View className="bg-purple-600/20 rounded-full p-1.5">
            <ArrowRightIcon size={16} color="#a78bfa" />
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
      <View className="flex-row items-center bg-gray-300 rounded-xl px-2 py-1 mb-4 border border-slate-700/50">
        <MagnifyingGlassIcon size={20} color="#94a3b8" />
        <TextInput
          className="ml-1 flex-1 text-base text-black "
          placeholder="Search your classes"
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Classes Heading */}
      <Text className="text-xl font-semibold text-white mb-4">My Classes</Text>

      {/* 📚 Class Grid */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await fetchClasses();
          setRefreshing(false);
        }}
        ListEmptyComponent={() => (
          <View className="py-8 items-center">
            <Text className="text-slate-300 text-center">No classes found</Text>
            <Text className="text-slate-400 text-center mt-1 text-sm">
              Create a new class to get started
            </Text>
          </View>
        )}
      />

      {/* Add Class Button */}
      <TouchableOpacity
        className="absolute bottom-6 left-0 right-0 mx-5 bg-purple-600 rounded-xl py-3 items-center"
        onPress={() => navigation.navigate("ClassroomDetails", { isNew: true })}
      >
        <View className="flex-row items-center">
          <Text className="text-white font-semibold text-base">
            + Create Classroom
          </Text>
        </View>
      </TouchableOpacity>
    </GradientBackground>
  );
}
