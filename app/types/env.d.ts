declare module "@env" {
  // API Configuration
  export const API_BASE_URL: string;

  // Authentication
  export const AUTH_TOKEN_EXPIRY_DAYS: string; // Number of days before token expires

  // App Configuration
  export const APP_ENV: string; // 'development', 'staging', 'production'
  export const APP_VERSION: string;

  // Feature Flags
  export const ENABLE_ANALYTICS: string; // 'true' or 'false'
}
