# WakaJor Web Application

A beautiful, premium web application for connecting rural communities with reliable transportation.

## Features

- 🎨 Beautiful landing page with scroll animations
- 🗺️ Google Maps integration for driver locations
- 📱 Phone number authentication with OTP
- 💬 Real-time chat with WebSocket support
- 📞 Direct calling and WhatsApp integration
- 👤 User profile management
- 🚗 Filter drivers by vehicle type (Bike, Tricycle, Car)

## Tech Stack

- **React** + **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Firebase Auth** for authentication
- **Google Maps API** for location services
- **Socket.io** for real-time messaging
- **Framer Motion** for animations
- **Lucide React** for icons

## Setup

### Prerequisites

- Node.js >= 20.19.4
- Yarn or npm

### Environment Variables

Create a `.env` file in the `apps/web` directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:4000

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build
```

## Project Structure

```
apps/web/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components (Button, Input, Card, etc.)
│   │   ├── Sidebar.tsx  # Navigation sidebar
│   │   ├── SignInModal.tsx
│   │   └── DriverContactModal.tsx
│   ├── pages/           # Page components
│   │   ├── LandingPage.tsx
│   │   ├── NearbyDriversPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── MessagesPage.tsx
│   ├── stores/          # Zustand stores
│   │   ├── auth.ts
│   │   ├── driver.ts
│   │   ├── chat.ts
│   │   └── ui.ts
│   ├── services/        # API and service layers
│   │   ├── auth.ts
│   │   ├── driver.ts
│   │   ├── chat.ts
│   │   ├── websocket.ts
│   │   └── maps.ts
│   ├── utils/           # Utility functions
│   │   ├── db.ts        # API endpoint definitions
│   │   └── fetch.ts     # Axios instance with auth
│   ├── config/          # Configuration files
│   │   └── firebase.ts
│   ├── theme/           # Theme configuration
│   │   └── colors.ts
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
```

## API Integration

The web app uses the same backend API as the mobile app. The API endpoints are defined in `src/utils/db.ts` and follow the same structure as the mobile app.

### API Updates

The `/drivers/public` endpoint now includes the `userId` field in the response, enabling full chat functionality without additional API calls.

## Development

The app runs on `http://localhost:4200` by default.

### Key Features Implementation

1. **Landing Page**: Beautiful scroll animations using Framer Motion
2. **Authentication**: Firebase phone authentication with reCAPTCHA
3. **Nearby Drivers**: Google Maps integration with distance calculation
4. **Chat**: Real-time messaging with WebSocket support
5. **Responsive Design**: Mobile-first design with Tailwind CSS

## Building for Production

```bash
yarn build
```

The built files will be in `dist/apps/web/`.

## License

MIT

