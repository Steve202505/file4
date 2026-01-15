# 🚀 Quick Start Guide

## Prerequisites Check
- [ ] Node.js installed (v16+)
- [ ] MongoDB installed and running
- [ ] Git installed

## Step-by-Step Setup (5 minutes)

### 1. Generate Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
**Copy the output** - you'll need it in step 3.

### 2. Install Backend Dependencies
```bash
cd trading-platform/backend
npm install
```

### 3. Configure Backend Environment
Open `backend/.env` and update:
```env
JWT_SECRET=paste_your_generated_secret_here
```

### 4. Start MongoDB
```bash
# Windows
# Start MongoDB service
Start-Service -Name "MongoDB"

# Stop MongoDB service
Stop-Service -Name "MongoDB"

# Restart MongoDB service
Restart-Service -Name "MongoDB"

# Check status
Get-Service -Name "MongoDB"

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 5. Start Backend Server
```bash
# Still in backend folder
npm run dev
```

You should see:
```
==================================================
✅ Server running on port 5000
📌 Environment: development
🔗 API URL: http://localhost:5000/api
==================================================
✅ MongoDB Connected: localhost
```

### 6. Install User Frontend Dependencies
Open a **NEW TERMINAL**:
```bash
cd trading-platform/user-frontend
npm install
npm start
```

Wait for: `Compiled successfully!`
Opens: http://localhost:3000

### 7. Install Agent Frontend Dependencies
Open **ANOTHER NEW TERMINAL**:
```bash
cd trading-platform/agent-frontend
npm install
npm start
```

Opens: http://localhost:3001

## ✅ Verify Installation

### Test Backend Health
Open browser: http://localhost:5000/health

Should see:
```json
{
  "status": "OK",
  "timestamp": "2025-01-09T...",
  "environment": "development"
}
```

### Test User Frontend
Go to: http://localhost:3000
- Should see login/signup page
- No console errors

### Test Agent Frontend
Go to: http://localhost:3001
- Should see agent login page
- No console errors

## 🎯 Create Test Accounts

### Create Admin (Optional)
```bash
cd trading-platform/backend
node createAdmin.js
```

### Create Test User
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill form:
   - Username: testuser
   - Email: test@example.com
   - Mobile: 1234567890
   - Password: Test123
4. Click "Sign Up"

### Test Login
1. Click "Login"
2. Enter credentials
3. Should redirect to dashboard

## 🆘 Troubleshooting

### "MongoDB connection error"
```bash
# Start MongoDB
# Windows
net start MongoDB

# Check if running
mongosh
```

### "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <number> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### "Module not found"
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### "JWT_SECRET missing"
Edit `backend/.env` and add:
```env
JWT_SECRET=your_secret_from_step_1
```

## 📱 URLs Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | http://localhost:5000/api | REST API |
| Health Check | http://localhost:5000/health | Server status |
| User App | http://localhost:3000 | End user interface |
| Agent App | http://localhost:3001 | Agent/Admin interface |

## 🎉 Success!

If all three services are running, you're ready to develop!

**Next:** Read the full [README.md](README.md) for API documentation and advanced features.

## 💡 Quick Commands

```bash
# Start all services (use 3 terminals)
cd backend && npm run dev
cd user-frontend && npm start  
cd agent-frontend && npm start

# Run tests
npm test

# Build for production
npm run build
```

## 📞 Need Help?

Check the [README.md](README.md) or create an issue in the repository.
