# Trading Platform

A comprehensive trading platform with user and agent management systems.

## 🚀 Project Structure

```
trading-platform/
├── backend/                 # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, validation, rate limiting
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Helper functions
│   └── server.js           # Entry point
│
├── user-frontend/          # React app for end users
│   └── src/
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── utils/          # Utilities
│
└── agent-frontend/         # React app for agents/admins
    └── src/
        ├── components/     # React components
        ├── pages/          # Page components
        ├── services/       # API services
        └── utils/          # Utilities
```

## ✅ Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn

## 🔧 Installation

### 1. Clone the repository

```bash
cd Project_Website
```

### 2. Install Backend Dependencies

```bash
cd trading-platform/backend
npm install
```

### 3. Install User Frontend Dependencies

```bash
cd ../user-frontend
npm install
```

### 4. Install Agent Frontend Dependencies

```bash
cd ../agent-frontend
npm install
```

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in `trading-platform/backend/`:

```bash
cp .env.example .env
```

Then edit `.env` with your settings:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/trading_platform
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
AGENT_JWT_EXPIRES_IN=8h
ADMIN_USERNAME=superadmin
```

**⚠️ IMPORTANT:** Generate a secure JWT_SECRET:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend Environment Variables

**User Frontend** - `trading-platform/user-frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WEBSITE_NAME=Trading Platform
```

**Agent Frontend** - `trading-platform/agent-frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
PORT=3001
BROWSER=none
```

## 🗄️ Database Setup

1. Start MongoDB:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

2. Create initial admin user (optional):
```bash
cd trading-platform/backend
node createAdmin.js
```

## 🚀 Running the Application

### Option 1: Run Each Service Separately

**Terminal 1 - Backend:**
```bash
cd trading-platform/backend
npm run dev
```

**Terminal 2 - User Frontend:**
```bash
cd trading-platform/user-frontend
npm start
```

**Terminal 3 - Agent Frontend:**
```bash
cd trading-platform/agent-frontend
npm start
```

### Option 2: Use npm scripts from root

```bash
# Install all dependencies
npm run install-all

# Start backend
npm run start-backend

# Start user frontend (in new terminal)
npm run start-user

# Start agent frontend (in new terminal)
npm run start-agent
```

## 🌐 Access Points

- **User Frontend:** http://localhost:3000
- **Agent Frontend:** http://localhost:3001
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

## 📚 API Documentation

### Authentication Endpoints

#### User Registration
```http
POST /api/auth/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "mobileNumber": "1234567890",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "referCode": "REFER123" // optional
}
```

#### User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "emailOrUsername": "john@example.com",
  "password": "SecurePass123"
}
```

#### Agent/Admin Login
```http
POST /api/auth/agent/login
Content-Type: application/json

{
  "username": "agent001",
  "password": "AgentPass123"
}
```

### Protected Routes

All protected routes require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on auth endpoints (5 requests per 15 minutes)
- ✅ API rate limiting (100 requests per 15 minutes)
- ✅ Helmet.js for security headers
- ✅ CORS configuration
- ✅ Input validation
- ✅ Environment variable validation
- ✅ Secure session management

## 🛡️ Role-Based Access Control

### User Roles
- **user**: End users with basic access
- **agent**: Can manage assigned users
- **admin**: Full system access

### Agent Permissions
- `view_users`: View user information
- `edit_users`: Edit user details
- `manage_winloss`: Manage win/loss controls
- `delete_users`: Delete/deactivate users (admin only)

## 📝 Common Issues & Solutions

### MongoDB Connection Error
```bash
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Port Already in Use
```bash
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Kill the process using the port
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

### JWT Secret Warning
```bash
Missing required environment variable: JWT_SECRET
```
**Solution:** Create/update `.env` file with a secure JWT_SECRET

## 🧪 Testing

```bash
# Run backend tests
cd trading-platform/backend
npm test

# Run frontend tests
cd trading-platform/user-frontend
npm test
```

## 📦 Building for Production

### Backend
```bash
cd trading-platform/backend
NODE_ENV=production npm start
```

### Frontend
```bash
# User Frontend
cd trading-platform/user-frontend
npm run build

# Agent Frontend
cd trading-platform/agent-frontend
npm run build
```

## 🐛 Debugging

Enable detailed logging by setting:
```env
NODE_ENV=development
```

View logs in the console or check log files.

## 📄 License

ISC

## 👥 Support

For issues and questions, please create an issue in the repository.

---

**Version:** 1.0.0  
**Last Updated:** January 2025
