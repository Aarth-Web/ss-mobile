import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { useAuth } from "../hooks/authContext";
import { GradientBackground, Button, THEME } from "../components/UIComponents";
import { UserCircleIcon, Cog6ToothIcon } from "react-native-heroicons/outline";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
        <View>
          <UserCircleIcon size={34} color={THEME.text.primary} />
        </View>
      </View>

      {/* User Profile */}
      <View className="mt-4 mb-6">
        <Text className="text-2xl font-semibold text-white mb-2">
          User Profile
        </Text>
        <Text className="text-slate-300">
          View and manage your account information
        </Text>
      </View>

      <ScrollView>
        <View className="bg-white/10 rounded-xl p-5 mb-5 border border-white/20">
          <View className="flex-row items-center mb-5">
            <View className="bg-purple-500/30 p-3 rounded-full">
              <UserCircleIcon size={24} color={THEME.primary} />
            </View>
            <Text className="text-white text-lg font-semibold ml-3">
              Personal Information
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-slate-400 mb-1">Full Name</Text>
            <Text className="text-white text-lg">
              {user?.name || "Name not available"}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-slate-400 mb-1">Email Address</Text>
            <Text className="text-white text-lg">
              {user?.email || "Email not available"}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-slate-400 mb-1">Role</Text>
            <Text className="text-white text-lg capitalize">
              {user?.role || "Role not available"}
            </Text>
          </View>

          {user?.mobile && (
            <View className="mb-2">
              <Text className="text-slate-400 mb-1">Mobile Number</Text>
              <Text className="text-white text-lg">{user.mobile}</Text>
            </View>
          )}
        </View>

        <Button
          title="Edit Profile"
          onPress={() => navigation.navigate("EditProfile")}
          style={{ marginBottom: 10 }}
        />

        <Button
          title="Reset Password"
          onPress={() => navigation.navigate("ResetPassword")}
          style={{ marginBottom: 10 }}
        />

        <Button
          title="Logout"
          variant="secondary"
          onPress={logout}
          style={{ marginBottom: 40 }}
        />
      </ScrollView>
    </GradientBackground>
  );
}
