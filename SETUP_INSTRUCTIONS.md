# GCT CoachHelper Setup Instructions

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis (optional, for caching)

## Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

4. Set up the database:
```bash
# Create a PostgreSQL database named 'gct_coachhelper'
createdb gct_coachhelper

# Run Prisma migrations
npm run db:push
npm run db:generate
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on http://localhost:3001

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. The frontend is already configured to connect to the backend API at localhost:3001

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on http://localhost:3000

## Testing the Setup

1. Open http://localhost:3000 in your browser
2. Try to sign up as a coach
3. The dashboard should now connect to the real API
4. Check the browser console for any errors

## Current Implementation Status

✅ **Completed:**
- JWT-based authentication system with refresh tokens
- Database schema with Prisma ORM
- Express.js backend with TypeScript
- Auth routes (register, login, OAuth, refresh, logout)
- Dashboard API endpoint with real data
- Frontend dashboard connected to real API
- WebSocket infrastructure for real-time updates
- Error handling middleware
- Rate limiting and security headers

⚠️ **In Progress:**
- Stripe payment integration
- Email notifications with SendGrid
- Assessment engine
- Client portal functionality

❌ **Not Started:**
- Deployment configuration
- CI/CD pipeline
- Monitoring and analytics

## Common Issues

### Database Connection Error
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env matches your setup
- Ensure the database exists: `createdb gct_coachhelper`

### Frontend Can't Connect to Backend
- Verify backend is running on port 3001
- Check NEXT_PUBLIC_API_URL in frontend/.env.local
- Look for CORS errors in browser console

### Authentication Issues
- Make sure JWT_SECRET is set in backend .env
- Check that tokens are being stored properly
- Verify the session handling in frontend

## Next Steps

1. **Add Stripe Integration** - Implement payment processing
2. **Complete Client Portal** - Build assessment flow
3. **Add Email Service** - Set up SendGrid for notifications
4. **Deploy to Production** - Set up hosting on Railway/Vercel