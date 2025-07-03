import Constants from "expo-constants";
import {
  API_BASE_URL,
  AUTH_TOKEN_EXPIRY_DAYS,
  APP_ENV,
  APP_VERSION,
  ENABLE_ANALYTICS,
} from "@env";

/**
 * This file provides a unified way to access environment variables,
 * regardless of whether they come from .env files (via react-native-dotenv)
 * or from Expo's Constants.manifest.extra (via app.config.js)
 */

// Get environment variables from Expo Constants (if available) or from .env via @env import
const getConfig = () => {
  const expoPlatformConfig = Constants?.expoConfig?.extra || {};

  return {
    // API Configuration
    API_BASE_URL:
      API_BASE_URL ||
      expoPlatformConfig.API_BASE_URL ||
      "https://ss-backend-uqx4.onrender.com",

    // Authentication
    AUTH_TOKEN_EXPIRY_DAYS:
      AUTH_TOKEN_EXPIRY_DAYS ||
      expoPlatformConfig.AUTH_TOKEN_EXPIRY_DAYS ||
      "7",

    // App Configuration
    APP_ENV: APP_ENV || expoPlatformConfig.APP_ENV || "development",
    APP_VERSION: APP_VERSION || expoPlatformConfig.APP_VERSION || "1.0.0",

    // Feature Flags
    ENABLE_ANALYTICS:
      ENABLE_ANALYTICS || expoPlatformConfig.ENABLE_ANALYTICS || "false",
  };
};

export const envConfig = getConfig();
export default envConfig;
