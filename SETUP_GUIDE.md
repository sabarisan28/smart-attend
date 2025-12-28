# 🚀 Setup Guide for Smart Attendance System

This guide will help you set up and run the Smart Attendance System on your local machine.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

## 🔧 Installation Steps

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd smart-attendance-system
```

### 2. Install All Dependencies
```bash
npm run install-all
```
This command will install dependencies for both frontend and backend.

### 3. Environment Setup
The project comes with pre-configured environment files, but you can customize them:

#### Backend Environment (`backend/.env`)
```env
# Database Configuration (already set for development)
DATABASE_URL=mock

# JWT Secret (already configured)
JWT_SECRET=your_super_secret_jwt_key_here_for_development

# Server Configuration
NODE_ENV=development
PORT=3000
```

#### Frontend Environment (`frontend/.env`)
```env
# API URL (already configured)
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Smart Attendance System
```

### 4. Start the Application
```bash
npm run dev
```

This will start both the frontend and backend servers:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

## 🔑 Login Credentials

The system comes with pre-configured test accounts:

| Role | Email | Password |
|------|-------|----------|
| Principal | principal@gmail.com | principal@123 |
| Faculty | faculty@gmail.com | faculty@123 |
| Student | student@gmail.com | student@123 |

## 🎯 Testing the System

### As Principal:
1. Login with principal credentials
2. View faculty and student lists with detailed profiles
3. Check department statistics

### As Faculty:
1. Login with faculty credentials
2. Go to "QR Generator" to create attendance QR codes
3. View "My Students" to see student details
4. Download QR codes or copy tokens for testing

### As Student:
1. Login with student credentials
2. Go to "Scan QR" page
3. Try all three scanning methods:
   - **Camera Scan**: Use your device camera
   - **Upload Image**: Upload a QR code image
   - **Manual Input**: Copy token from faculty page

## 🗄️ Database Information

The system uses a **mock in-memory database** by default, which includes:
- Sample users with detailed profiles
- Pre-created subjects and attendance sessions
- Mock attendance records for testing

**No database setup required for development!**

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run server` | Start only backend server |
| `npm run client` | Start only frontend |
| `npm run build` | Build frontend for production |
| `npm run install-all` | Install all dependencies |

## 🔧 Troubleshooting

### Port Already in Use
If you get port errors:
```bash
# Kill processes on ports 3000 and 5173
npx kill-port 3000 5173
```

### Dependencies Issues
If you encounter dependency issues:
```bash
# Clean install
rm -rf node_modules frontend/node_modules backend/node_modules
rm package-lock.json frontend/package-lock.json backend/package-lock.json
npm run install-all
```

### Browser Issues
- Clear browser cache and cookies
- Try incognito/private mode
- Ensure JavaScript is enabled

## 📱 Features to Test

### QR Code Generation & Scanning
1. **Generate QR**: Login as faculty → QR Generator → Select subject → Generate
2. **Download QR**: Click download button to save QR image
3. **Scan QR**: Login as student → Scan QR → Try all three methods

### User Management
1. **Principal Dashboard**: View all faculty and students
2. **Faculty Students**: View students in your department
3. **Attendance Reports**: Check attendance statistics

### Leave Management
1. **Apply Leave**: Student → Leave Management → Apply
2. **Approve Leave**: Faculty → Leave Requests → Approve/Reject

## 🌐 Production Deployment (Optional)

To deploy to production with a real database:

1. **Set up Supabase** (free PostgreSQL database)
2. **Update environment variables** with real database credentials
3. **Deploy to Vercel** (free hosting)

Detailed deployment instructions are in the main README.md file.

## 🆘 Need Help?

If you encounter any issues:

1. **Check the console** for error messages
2. **Restart the servers** (`Ctrl+C` then `npm run dev`)
3. **Check this guide** for common solutions
4. **Review the main README.md** for detailed documentation

## 🎉 You're All Set!

The Smart Attendance System should now be running successfully. Enjoy exploring all the features!

---

**Happy coding! 🚀**