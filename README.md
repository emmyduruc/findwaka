# LocalRide Hub - Nx Monorepo

Rural Nigeria mobility hub for Bike (Okada), Tricycle (Keke), and Car drivers.

## Structure

- `apps/api` - NestJS backend API
- `apps/web` - React + Vite web application
- `packages/shared` - Shared types and utilities

## Setup

### Prerequisites

- Node.js 18+
- Yarn
- PostgreSQL database
- Firebase project with service account

### Installation

```bash
yarn install
```

### Environment Variables

Create `.env` file in `apps/api`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/localride
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project",...}
PORT=4000
```

### Database Setup

1. Create PostgreSQL database
2. Run migrations:

```bash
yarn api:migrate
```

3. Generate new migration:

```bash
yarn api:migration:generate MigrationName
```

## Development Commands

### Start Individual Apps

**API (Backend):**
```bash
yarn api:dev
```
API will be available at `http://localhost:4000`
Swagger documentation at `http://localhost:4000/docs`

**Web (React + Vite):**
```bash
yarn web:dev
```
Web app will be available at `http://localhost:4200`

### Build Commands

```bash
yarn api:build      # Build API
yarn web:build      # Build web app
```

## API Endpoints

### Auth
- `POST /auth/bootstrap` - Bootstrap user account (Protected)

### Users
- `GET /users/me` - Get current user (Protected)
- `PATCH /users/me` - Update current user (Protected)

### Passengers
- `GET /passengers/me` - Get passenger profile (Protected, PASSENGER)
- `PATCH /passengers/me` - Update passenger profile (Protected, PASSENGER)

### Drivers
- `POST /drivers/me` - Create driver profile (Protected, DRIVER)
- `GET /drivers/me` - Get driver profile (Protected, DRIVER)
- `PATCH /drivers/me` - Update driver profile (Protected, DRIVER)
- `GET /drivers/public` - Get public driver list (Public)

### Presence
- `PUT /presence/me/online` - Set driver online (Protected, DRIVER)
- `PUT /presence/me/offline` - Set driver offline (Protected, DRIVER)
- `PUT /presence/me/location` - Update driver location (Protected, DRIVER)

### Documents
- `POST /drivers/me/documents` - Create document (Protected, DRIVER)
- `GET /drivers/me/documents` - Get all documents (Protected, DRIVER)
- `PATCH /drivers/me/documents/:id` - Update document (Protected, DRIVER)

### Admin
- `GET /admin/drivers/pending-docs` - Get pending documents (Protected, ADMIN)
- `PATCH /admin/documents/:id/approve` - Approve document (Protected, ADMIN)
- `PATCH /admin/documents/:id/reject` - Reject document (Protected, ADMIN)

### Reviews
- `POST /drivers/:driverId/reviews` - Create review (Protected, PASSENGER)
- `GET /drivers/:driverId/reviews` - Get reviews (Public)

## Authentication

All protected endpoints require Firebase ID token in Authorization header:

```
Authorization: Bearer <firebaseIdToken>
```

The backend verifies the token using Firebase Admin SDK and creates/maintains local user records.
