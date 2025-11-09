# Quick Start Guide

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Google Maps API key
- Payment gateway API keys (optional for testing)

## Installation Steps

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Set Up Environment Variables

#### Backend

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nepal-hotel-booking
JWT_SECRET=your-secret-key-here
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 3. Create Admin User

```bash
npm run create-admin
```

### 4. Start Development Servers

#### Terminal 1 - Backend

```bash
npm run dev:backend
```

#### Terminal 2 - Frontend

```bash
npm run dev:frontend
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## Default Admin Credentials

- Email: admin@nepalhotelbooking.com
- Password: admin123

## Next Steps

1. Register a property owner account
2. Create a property listing
3. Login as admin and approve the property
4. Book the property as a regular user

## Troubleshooting

- If MongoDB connection fails, check your connection string
- If Google Maps doesn't load, verify your API key
- For payment issues, use test credentials during development

For detailed setup instructions, see [SETUP.md](./SETUP.md)



