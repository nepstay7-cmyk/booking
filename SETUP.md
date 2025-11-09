# Setup Instructions

## Quick Start Guide

### 1. Install Dependencies

From the project root, run:

```bash
npm run install:all
```

Or install separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Set Up MongoDB

#### Option A: Local MongoDB

- Install MongoDB locally
- Start MongoDB service
- Use connection string: `mongodb://localhost:27017/nepal-hotel-booking`

#### Option B: MongoDB Atlas (Recommended)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get your connection string
4. Replace `<password>` with your database password

### 3. Configure Environment Variables

#### Backend (.env)

Create `backend/.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
KHALTI_SECRET_KEY=your-khalti-secret-key
ESEWA_SECRET_KEY=your-esewa-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@nepalhotelbooking.com
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@nepalhotelbooking.com
ADMIN_PASSWORD=admin123
```

#### Frontend (.env.local)

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 4. Get API Keys

#### Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Maps JavaScript API and Places API
4. Create credentials (API Key)
5. Add to both backend and frontend .env files

#### Payment Gateway Keys

- **Khalti**: Sign up at [Khalti](https://khalti.com/)
- **eSewa**: Sign up at [eSewa](https://esewa.com.np/)
- **Stripe**: Sign up at [Stripe](https://stripe.com/)

### 5. Create Admin User

Run the admin creation script:

```bash
cd backend
node utils/createAdmin.js
```

Or create manually through the registration page with role `companyAdmin` (you'll need to modify the code to allow this).

### 6. Start the Application

#### Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

#### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

### 7. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## Default Admin Credentials

After running the admin creation script:

- Email: admin@nepalhotelbooking.com (or as set in ADMIN_EMAIL)
- Password: admin123 (or as set in ADMIN_PASSWORD)
- Role: companyAdmin

## User Roles

1. **user** - Regular users who can book properties
2. **propertyOwner** - Can create and manage properties (requires verification)
3. **companyAdmin** - Full system access

## Testing the Application

1. Register a new user account
2. Register a property owner account
3. Login as property owner and create a property
4. Login as company admin and approve the property
5. Login as regular user and book the property
6. Test payment integration (use test credentials)

## Troubleshooting

### MongoDB Connection Issues

- Check if MongoDB is running
- Verify connection string in .env
- Check network connectivity (for Atlas)

### Port Already in Use

- Change PORT in backend/.env
- Update NEXT_PUBLIC_API_URL in frontend/.env.local

### Google Maps Not Loading

- Verify API key is correct
- Check if Maps JavaScript API is enabled
- Verify API key restrictions

### Payment Gateway Issues

- Use test credentials for development
- Check API keys are correct
- Verify webhook URLs (if applicable)

## Production Deployment

### Backend (Render/AWS)

1. Set environment variables in hosting platform
2. Deploy code
3. Ensure MongoDB connection is configured
4. Set up proper CORS settings

### Frontend (Vercel)

1. Connect GitHub repository
2. Set environment variables
3. Deploy

### Database (MongoDB Atlas)

1. Create production cluster
2. Whitelist deployment server IPs
3. Use connection string with credentials

## Additional Notes

- Uploads directory is created automatically
- Email service requires SMTP credentials
- Payment gateways need proper webhook setup for production
- Use environment variables for all sensitive data
- Enable HTTPS in production
- Set up proper error logging and monitoring



