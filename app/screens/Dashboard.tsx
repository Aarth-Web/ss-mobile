import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../hooks/authContext";

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold mb-4">Welcome to Dashboard</Text>
      <TouchableOpacity
        className="bg-red-600 px-6 py-3 rounded-lg"
        onPress={logout}
      >
        <Text className="text-white font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
