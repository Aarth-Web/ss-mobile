import {
  API_BASE_URL,
  APP_ENV,
  APP_VERSION,
  AUTH_TOKEN_EXPIRY_DAYS,
  ENABLE_ANALYTICS,
} from "@env";

// Default values for environment variables if not set
const DEFAULT_API_URL = "http://localhost:3003";
const DEFAULT_TOKEN_EXPIRY = "7"; // days
const DEFAULT_APP_ENV = "development";
const DEFAULT_APP_VERSION = "1.0.0";
const DEFAULT_ENABLE_ANALYTICS = "false";

export const apiConfig = {
  // API Configuration
  baseUrl: API_BASE_URL || DEFAULT_API_URL,

  // Authentication Configuration
  auth: {
    tokenExpiryDays: Number(AUTH_TOKEN_EXPIRY_DAYS || DEFAULT_TOKEN_EXPIRY),
  },

  // App Configuration
  app: {
    environment: APP_ENV || DEFAULT_APP_ENV,
    version: APP_VERSION || DEFAULT_APP_VERSION,
    isProduction: (APP_ENV || DEFAULT_APP_ENV) === "production",
    isDevelopment: (APP_ENV || DEFAULT_APP_ENV) === "development",
    isStaging: (APP_ENV || DEFAULT_APP_ENV) === "staging",
  },

  // Feature Flags
  features: {
    enableAnalytics: (ENABLE_ANALYTICS || DEFAULT_ENABLE_ANALYTICS) === "true",
  },
};

export default apiConfig;
