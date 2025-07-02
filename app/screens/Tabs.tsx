import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./Home";
import {
  UserCircleIcon,
  HomeIcon,
  UsersIcon,
  Cog6ToothIcon,
} from "react-native-heroicons/outline";
import Students from "./Students";
import Settings from "./Settings";
import { THEME } from "../components/UIComponents";
import { View, TouchableOpacity } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        height: 60,
        backgroundColor: THEME.background.end,
        borderTopWidth: 1,
        borderTopColor: "rgba(255, 255, 255, 0.1)",
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const color = isFocused ? THEME.primary : THEME.text.secondary;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            {options.tabBarIcon &&
              options.tabBarIcon({ focused: isFocused, color, size: 24 })}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function Tabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Classes"
        component={Home}
        options={{
          tabBarIcon: ({ color, size }) => (
            <HomeIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Students"
        component={Students}
        options={{
          tabBarIcon: ({ color, size }) => (
            <UsersIcon color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Cog6ToothIcon color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
