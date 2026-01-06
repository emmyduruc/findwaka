# Environment Variables Setup Guide

This document explains how to set up environment variables for each app in the monorepo.

## Quick Start

1. Copy the `.env.example` file in each app directory to `.env`
2. Fill in the actual values for your environment
3. Never commit `.env` files to git (they're in `.gitignore`)

## API (Backend) - `apps/api/.env`

### Required Variables

**DATABASE_URL**
- PostgreSQL connection string
- Format: `postgresql://username:password@host:port/database`
- Example: `postgresql://postgres:mypassword@localhost:5432/localride`

**FIREBASE_SERVICE_ACCOUNT_JSON**
- Complete Firebase service account JSON as a string
- Get it from: Firebase Console > Project Settings > Service Accounts > Generate new private key
- **Important**: The entire JSON must be on one line as a string (escape quotes with `\"`)
- Example:
  ```json
  {"type":"service_account","project_id":"my-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",...}
  ```

### Optional Variables

**PORT**
- API server port (default: 4000)
- Example: `PORT=4000`

**NODE_ENV**
- Environment mode: `development` or `production`
- Example: `NODE_ENV=development`

## Web App - `apps/web/.env`

### Required Variables

**VITE_API_URL**
- Backend API base URL
- Example: `VITE_API_URL=http://localhost:4000`
- For production: `VITE_API_URL=https://api.yourdomain.com`

**VITE_FIREBASE_* Variables**
- Firebase client configuration
- Get from: Firebase Console > Project Settings > General > Your apps (Web app)
- Required variables:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

**Note**: Vite requires the `VITE_` prefix for environment variables to be exposed to the client.

## Expo App - `apps/expo/.env`

### Required Variables

**EXPO_PUBLIC_API_URL**
- Backend API base URL
- Example: `EXPO_PUBLIC_API_URL=http://localhost:4000`
- For production: `EXPO_PUBLIC_API_URL=https://api.yourdomain.com`

**EXPO_PUBLIC_FIREBASE_* Variables**
- Firebase client configuration
- Get from: Firebase Console > Project Settings > General > Your apps (iOS/Android app)
- Required variables:
  - `EXPO_PUBLIC_FIREBASE_API_KEY`
  - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
  - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `EXPO_PUBLIC_FIREBASE_APP_ID`

**Note**: Expo requires the `EXPO_PUBLIC_` prefix for environment variables to be exposed to the client.

## Setup Steps

1. **Create `.env` files:**
   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   cp apps/expo/.env.example apps/expo/.env
   ```

2. **Fill in the values:**
   - Edit each `.env` file with your actual configuration
   - For Firebase, create a project at https://console.firebase.google.com
   - For database, set up a PostgreSQL instance

3. **Verify:**
   - API: Check that `DATABASE_URL` and `FIREBASE_SERVICE_ACCOUNT_JSON` are set
   - Web/Expo: Check that all `VITE_*` or `EXPO_PUBLIC_*` variables are set

## Security Notes

- ⚠️ **Never commit `.env` files** - they contain sensitive information
- ✅ `.env.example` files are safe to commit (they contain no secrets)
- 🔒 Keep your Firebase service account JSON secure
- 🔒 Use strong database passwords
- 🔒 In production, use environment variable management tools (AWS Secrets Manager, etc.)

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing
3. Enable Authentication (Email/Password, Phone, Google)
4. Get Service Account:
   - Project Settings > Service Accounts > Generate new private key
5. Get Client Config:
   - Project Settings > General > Your apps
   - Add Web app or iOS/Android app
   - Copy the config values

## Database Setup

1. Install PostgreSQL locally or use a cloud service
2. Create a database:
   ```sql
   CREATE DATABASE localride;
   ```
3. Update `DATABASE_URL` in `apps/api/.env`
4. Run migrations:
   ```bash
   yarn api:migrate
   ```

