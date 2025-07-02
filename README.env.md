# Environment Variables

This project uses environment variables to configure various settings. Below is a list of the environment variables used:

## API Configuration

- `API_BASE_URL`: The base URL for API calls (e.g., http://api.example.com:3003)

## Authentication Configuration

- `AUTH_TOKEN_EXPIRY_DAYS`: Number of days before the authentication token expires (e.g., 7)

## App Configuration

- `APP_ENV`: The environment the app is running in. Values: 'development', 'staging', 'production'
- `APP_VERSION`: The version of the app (e.g., 1.0.0)

## Feature Flags

- `ENABLE_ANALYTICS`: Whether to enable analytics tracking. Values: 'true', 'false'

## Setup Instructions

### Development Environment

1. Copy `.env.example` to `.env` in the root directory of your project
   ```bash
   cp .env.example .env
   ```
2. Edit the `.env` file and set the appropriate values for your development environment

### Production Deployment

For production deployments, ensure you set up environment variables securely:

1. Never commit your production `.env` file to version control
2. Set up environment variables securely in your CI/CD pipeline or hosting platform
3. Use different values for production vs. development environments
4. Regularly rotate sensitive credentials

## Example Configuration

```
# API Configuration
API_BASE_URL=http://api.example.com

# Authentication
AUTH_TOKEN_EXPIRY_DAYS=7

# App Configuration
APP_ENV=production
APP_VERSION=1.0.0

# Feature Flags
ENABLE_ANALYTICS=true
```

- The default values will be used if the environment variables are not set
- You can change the values in the `.env` file for different environments
- Remember to restart the development server after changing the values

## Adding New Environment Variables

If you need to add new environment variables:

1. Add them to your `.env` file
2. Update the type declarations in `app/types/env.d.ts`
3. Import them using `import { VARIABLE_NAME } from '@env';`
