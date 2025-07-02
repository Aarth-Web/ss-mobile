# SmartShala Mobile App

## Overview

SmartShala is a mobile application for school attendance management, student tracking, and classroom organization.

## Setup Instructions

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/ss-mobile.git
cd ss-mobile
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables

```bash
cp .env.example .env
# Edit the .env file with your configuration
```

4. Start the development server

```bash
npm start
# or
yarn start
```

### Environment Configuration

This project uses environment variables for configuration. For detailed information about the available environment variables and how to set them up, see [README.env.md](./README.env.md).

## Deployment

### Building for Production

1. Make sure your environment variables are properly set for production.

2. Build the app:

   ```bash
   expo build:android
   # or
   expo build:ios
   ```

3. Follow the Expo build process instructions.

### Best Practices for Deployment

- Never include sensitive API keys, tokens, or credentials in your code
- Use different environment variables for development, staging, and production
- Follow the security guidelines outlined in README.env.md

## Features

- Teacher Authentication
- Classroom Management
- Student Management
- Attendance Tracking
- Attendance Records
- SMS Notifications for absent students

## Contributing

Please read our contribution guidelines before submitting pull requests.

## License

[Specify your license information here]
