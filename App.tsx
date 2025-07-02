import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text, TextInput, View } from "react-native";
import Login from "./app/screens/Login";
import Splash from "./app/screens/Splash";
import Tabs from "./app/screens/Tabs";
import ClassroomDetails from "./app/screens/ClassroomDetails";
import ClassroomStudents from "./app/screens/ClassroomStudents";
import TakeAttendance from "./app/screens/TakeAttendance";
import ConfirmAbsentees from "./app/screens/ConfirmAbsentees";
import AddStudent from "./app/screens/AddStudent";
import AddStudentsToClassroom from "./app/screens/AddStudentsToClassroom";
import EditStudent from "./app/screens/EditStudent";
import AttendanceRecords from "./app/screens/AttendanceRecords";
import AttendanceRecordDetails from "./app/screens/AttendanceRecordDetails";
import ResetPassword from "./app/screens/ResetPassword";
import EditProfile from "./app/screens/EditProfile";
import { AuthProvider, useAuth } from "./app/hooks/authContext";
import useAppFonts from "./app/config/fonts";

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { token } = useAuth();
  const [showSplash, setShowSplash] = React.useState(true);

  if (showSplash)
    return <Splash onAnimationFinish={() => setShowSplash(false)} />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen
              name="ClassroomDetails"
              component={ClassroomDetails}
            />
            <Stack.Screen name="AddStudent" component={AddStudent} />
            <Stack.Screen name="EditStudent" component={EditStudent} />
            <Stack.Screen
              name="AddStudentsToClassroom"
              component={AddStudentsToClassroom}
            />
            <Stack.Screen
              name="ClassroomStudents"
              component={ClassroomStudents}
            />
            <Stack.Screen name="TakeAttendance" component={TakeAttendance} />
            <Stack.Screen
              name="ConfirmAbsentees"
              component={ConfirmAbsentees}
            />
            <Stack.Screen
              name="AttendanceRecords"
              component={AttendanceRecords}
            />
            <Stack.Screen
              name="AttendanceRecordDetails"
              component={AttendanceRecordDetails}
            />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
          </>
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    if (fontsLoaded) {
      // Monkey patch: Map fontWeight to actual font
      const getFontFamily = (weight?: string, className?: string): string => {
        if (
          className?.includes("font-bold") ||
          weight === "bold" ||
          weight === "700"
        )
          return "RedditSans-Bold";
        if (
          className?.includes("font-semibold") ||
          weight === "500" ||
          weight === "medium"
        )
          return "RedditSans-Medium";

        return "RedditSans-Regular";
      };

      const applyFontPatch = (Component: any) => {
        const oldRender = Component.render;

        Component.render = function (...args: any[]) {
          const origin = oldRender.call(this, ...args);
          const originalProps = origin.props || {};

          const patchedStyle = [
            {
              fontFamily: getFontFamily(
                originalProps.style?.fontWeight,
                originalProps.className
              ),
            },
            originalProps.style,
          ];

          return React.cloneElement(origin, {
            ...originalProps,
            style: patchedStyle,
          });
        };
      };

      applyFontPatch(Text);
      applyFontPatch(TextInput);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text style={{ color: "white" }}>Loading Fonts...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
