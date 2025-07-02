import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  school: string; // schoolId
  mobile?: string;
  registrationId?: string;
  isActive?: boolean;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load token and user data from storage on app start
    const loadAuthData = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        const savedUserData = await AsyncStorage.getItem("userData");

        if (savedToken) setToken(savedToken);
        if (savedUserData) setUser(JSON.parse(savedUserData));
      } catch (error) {
        console.error("Error loading auth data:", error);
      }
    };

    loadAuthData();
  }, []);

  const login = (token: string, userData: User) => {
    setToken(token);
    setUser(userData);
    AsyncStorage.setItem("token", token);
    AsyncStorage.setItem("userData", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    AsyncStorage.removeItem("token");
    AsyncStorage.removeItem("userData");
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
