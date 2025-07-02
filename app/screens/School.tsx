import { View, Text } from "react-native";
import { GradientBackground } from "../components/UIComponents";

export default function School() {
  return (
    <GradientBackground style={{ paddingTop: 60, paddingHorizontal: 20 }}>
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-semibold text-white">School Screen</Text>
        <Text className="text-slate-300 mt-2">Coming soon</Text>
      </View>
    </GradientBackground>
  );
}
