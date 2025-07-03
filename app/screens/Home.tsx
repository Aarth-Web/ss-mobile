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
  ActivityIndicator,
} from "react-native";
import {
  UserCircleIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  ArrowRightIcon,
  XCircleIcon,
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
  const [loading, setLoading] = useState(true); // Add loading state
  const { token, user, logout } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch classes
  const fetchClasses = async () => {
    // Only show loading indicator if we're not refreshing
    if (!refreshing) {
      setLoading(true);
    }

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
    } finally {
      // Set loading to false regardless of success or failure
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Focus listener to refresh classes when returning from create class screen
  useFocusEffect(
    React.useCallback(() => {
      fetchClasses();
      // Clean up function to avoid state updates after component unmount
      return () => {
        // Cancel any pending operations if needed
      };
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
          <Text
            className="text-lg text-white ml-0.5"
            style={{ fontFamily: "RedditSans-Bold" }}
          >
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
          placeholder="Search your classes"
          placeholderTextColor={THEME.text.secondary}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch("")} className="p-1">
            <XCircleIcon size={20} color={THEME.text.secondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Classes Heading */}
      <Text className="text-xl font-semibold text-white mb-4">My Classes</Text>

      {/* 📚 Class Grid */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center py-10">
          <View className="bg-purple-500/10 p-4 rounded-full mb-4">
            <UsersIcon size={32} color={THEME.text.secondary} />
          </View>
          <Text className="text-white text-lg font-medium">
            Loading classes...
          </Text>
          <View className="mt-4 flex-row items-center justify-center">
            {/* Replacing with a proper ActivityIndicator */}
            <View className="h-10 justify-center">
              <ActivityIndicator size="small" color={THEME.primary} />
            </View>
          </View>
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
            await fetchClasses();
          }}
          ListEmptyComponent={() => (
            <View className="py-8 items-center">
              <View className="bg-purple-500/10 p-4 rounded-full mb-4">
                <UsersIcon size={32} color={THEME.text.secondary} />
              </View>
              {search ? (
                // Show this when search has no results
                <>
                  <Text className="text-white text-lg font-medium text-center">
                    No matching classes
                  </Text>
                  <Text className="text-slate-400 text-center mt-2 px-8">
                    Try a different search term or clear the search
                  </Text>
                  <TouchableOpacity
                    className="mt-6 bg-purple-600 px-5 py-2.5 rounded-lg"
                    onPress={() => setSearch("")}
                  >
                    <Text className="text-white font-medium">Clear Search</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // Show this when there are no classes at all
                <>
                  <Text className="text-white text-lg font-medium text-center">
                    No classes found
                  </Text>
                  <Text className="text-slate-400 text-center mt-2 px-8">
                    Create a new classroom to get started with attendance
                    management
                  </Text>
                  <TouchableOpacity
                    className="mt-6 bg-purple-600 px-5 py-2.5 rounded-lg"
                    onPress={() =>
                      navigation.navigate("ClassroomDetails", { isNew: true })
                    }
                  >
                    <Text className="text-white font-medium">
                      + Create Classroom
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        />
      )}

      {/* Add Class Button */}
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
