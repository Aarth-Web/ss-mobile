import envConfig from "./env";

// Default values for environment variables if not set
const DEFAULT_API_URL = "https://ss-backend-uqx4.onrender.com";
const DEFAULT_TOKEN_EXPIRY = "7"; // days
const DEFAULT_APP_ENV = "development";
const DEFAULT_APP_VERSION = "1.0.0";
const DEFAULT_ENABLE_ANALYTICS = "false";

export const apiConfig = {
  // API Configuration
  baseUrl: envConfig.API_BASE_URL || DEFAULT_API_URL,

  // Authentication Configuration
  auth: {
    tokenExpiryDays: Number(
      envConfig.AUTH_TOKEN_EXPIRY_DAYS || DEFAULT_TOKEN_EXPIRY
    ),
  },

  // App Configuration
  app: {
    environment: envConfig.APP_ENV || DEFAULT_APP_ENV,
    version: envConfig.APP_VERSION || DEFAULT_APP_VERSION,
    isProduction: (envConfig.APP_ENV || DEFAULT_APP_ENV) === "production",
    isDevelopment: (envConfig.APP_ENV || DEFAULT_APP_ENV) === "development",
    isStaging: (envConfig.APP_ENV || DEFAULT_APP_ENV) === "staging",
  },

  // Feature Flags
  features: {
    enableAnalytics:
      (envConfig.ENABLE_ANALYTICS || DEFAULT_ENABLE_ANALYTICS) === "true",
  },
};

export default apiConfig;
