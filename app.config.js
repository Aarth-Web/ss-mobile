const fs = require("fs");
const path = require("path");

// Helper function to read environment variables from .env file
function parseEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return {};
    }

    const content = fs.readFileSync(filePath, "utf8");
    const env = {};

    content.split("\n").forEach((line) => {
      const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if they exist
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        env[key] = value;
      }
    });

    return env;
  } catch (e) {
    console.error("Error parsing .env file:", e);
    return {};
  }
}

// Read the environment file
const envPath = path.resolve(__dirname, ".env");
const env = parseEnvFile(envPath);

// Default config that will be overridden by app.json
module.exports = {
  name: "Smart Shala",
  slug: "ss-mobile",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  jsEngine: "hermes",
  splash: {
    image: "./assets/adaptive-logo.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  extra: {
    // Pass environment variables to the app
    API_BASE_URL: env.API_BASE_URL || "https://ss-backend-uqx4.onrender.com",
    AUTH_TOKEN_EXPIRY_DAYS: env.AUTH_TOKEN_EXPIRY_DAYS || "7",
    APP_ENV: env.APP_ENV || "development",
    APP_VERSION: env.APP_VERSION || "1.0.0",
    ENABLE_ANALYTICS: env.ENABLE_ANALYTICS || "false",
    eas: {
      projectId: "3ad37c1a-cb50-4ee7-be0c-9c55f5f4561d",
    },
  },
  plugins: [
    [
      "expo-build-properties",
      {
        android: {
          usesCleartextTraffic: true,
        },
      },
    ],
  ],
  android: {
    package: "com.adi77.smartshala",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-logo.png",
      backgroundColor: "#ffffff",
    },
    icon: "./assets/logo.png",
  },
  updates: {
    url: "https://u.expo.dev/3ad37c1a-cb50-4ee7-be0c-9c55f5f4561d",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
};
