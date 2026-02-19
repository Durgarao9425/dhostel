# Hostel Management System - Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- MySQL 8.0 running
- Database already created and seeded (as per previous setup)

## Installation Steps

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 2. Install Backend Dependencies

```bash
cd ../backend
npm install
```

## Running the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:8081`

### Start Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000` or `http://localhost:5173`

## Default Login Credentials

### Admin Account
- **Email:** `admin@hostelapp.com`
- **Password:** `password123` (Note: Update password hash in database)

### Hostel Owner Accounts
- **Email:** `mahendra@gmail.com`
- **Password:** `password123` (Note: Update password hash in database)

## Testing the Setup

1. **Open browser** and navigate to `http://localhost:3000`
2. **Login** with admin credentials
3. **Check Dashboard** - You should see statistics
4. **Test API** - Visit `http://localhost:8081/health` to check backend

## Folder Structure Overview

```
hostel-management/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # State management (Zustand)
│   │   └── App.tsx        # Main app component
│   └── package.json
│
├── backend/               # Node.js backend API
│   ├── src/
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, validation, etc.
│   │   ├── config/        # Database config
│   │   └── server.ts      # Express server
│   └── package.json
│
└── database_schema.sql    # Database schema with data
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled JavaScript

## Next Steps

1. **Update Passwords** - Hash real passwords using bcrypt
2. **Configure Email/SMS** - Add Nodemailer and Twilio credentials in `.env`
3. **Add More Routes** - Create hostel, room, student, fee, expense routes
4. **Build More Pages** - Add dashboard, hostel list, student management pages
5. **Deploy** - Deploy frontend to Vercel and backend to Railway/Render

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8081
npx kill-port 8081

# Kill process on port 3000
npx kill-port 3000
```

### Database Connection Error
- Check if MySQL is running
- Verify credentials in `backend/.env`
- Ensure database `Hostel` exists

### CORS Error
- Verify `ALLOWED_ORIGINS` in `backend/.env`
- Check frontend URL matches allowed origin

## Password Hashing for Testing

To create hashed passwords for testing:

```javascript
import bcrypt from 'bcryptjs';

const password = 'password123';
const hash = await bcrypt.hash(password, 10);
console.log(hash);
```

Then update the `users` table with the proper hash.

## API Documentation

Full API documentation is available in `DEVELOPMENT_PLAN.md`

Key endpoints:
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/register-owner` - Register new owner (Admin only)

## Support

For issues or questions, check:
1. `DEVELOPMENT_PLAN.md` - Full development guide
2. `README.md` - Project overview
3. GitHub issues (if repository is public)

---

**Happy Coding! 🚀**
