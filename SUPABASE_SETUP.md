# 🗄️ Supabase Setup Guide for Smart Attendance System

This guide will help you set up Supabase PostgreSQL database for your Smart Attendance System.

## 🚀 Step 1: Create Supabase Project

1. **Go to Supabase**: https://supabase.com
2. **Sign up/Login** to your account
3. **Click "New Project"**
4. **Fill in project details**:
   - **Organization**: Choose or create one
   - **Name**: `Smart Attendance System`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
5. **Click "Create new project"**
6. **Wait for setup** (takes 1-2 minutes)

## 🗄️ Step 2: Run Database Schema

1. **Go to SQL Editor** in your Supabase dashboard
2. **Copy the PostgreSQL schema** from `database/schema-postgresql.sql`
3. **Paste it in the SQL Editor**
4. **Click "Run"** to execute

### ⚠️ Important: Use PostgreSQL Schema
- **Use**: `database/schema-postgresql.sql` ✅
- **Don't use**: `database/schema.sql` ❌ (This is for MySQL)

## 🔧 Step 3: Get Connection Details

1. **Go to Settings** → **Database** in Supabase dashboard
2. **Copy these connection details**:

```
Host: db.your-project-ref.supabase.co
Database name: postgres
Username: postgres
Port: 5432
Password: [your-project-password]
```

## ⚙️ Step 4: Update Environment Variables

Update your `backend/.env` file:

```env
# Change from mock to supabase
DATABASE_URL=supabase

# Add your Supabase details
SUPABASE_DB_HOST=db.your-project-ref.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-actual-password
SUPABASE_DB_NAME=postgres

# Keep existing settings
JWT_SECRET=your_super_secret_jwt_key_here_for_development
NODE_ENV=development
PORT=3000
```

## 📦 Step 5: Install PostgreSQL Driver

```bash
cd backend
npm install pg
```

## 🚀 Step 6: Test Connection

1. **Restart your server**:
   ```bash
   npm run dev
   ```

2. **Check the logs** for:
   ```
   ✅ Connected to Supabase PostgreSQL database
   ```

## 🔍 Step 7: Verify Data

1. **Go to Supabase Dashboard** → **Table Editor**
2. **Check these tables exist**:
   - `users` (with sample data)
   - `subjects`
   - `attendance_sessions`
   - `attendance_records`
   - `leave_requests`

3. **Verify sample users**:
   - Principal: principal@gmail.com
   - Faculty: faculty@gmail.com
   - Student: student@gmail.com

## 🎯 Step 8: Test the Application

1. **Login with sample credentials**:
   - Principal: principal@gmail.com / principal@123
   - Faculty: faculty@gmail.com / faculty@123
   - Student: student@gmail.com / student@123

2. **Test key features**:
   - Generate QR codes (Faculty)
   - Scan QR codes (Student)
   - View dashboards (All roles)

## 🔧 Troubleshooting

### Connection Issues
```bash
# Check if PostgreSQL driver is installed
npm list pg

# Install if missing
npm install pg
```

### Schema Errors
- Make sure you used `schema-postgresql.sql` not `schema.sql`
- PostgreSQL uses different syntax than MySQL

### Authentication Errors
- Double-check your database password
- Ensure all environment variables are set correctly
- Restart the server after changing .env

### SSL Errors
- Supabase requires SSL connections (already configured)
- Don't disable SSL in production

## 📊 Database Schema Overview

### Tables Created:
- **users**: Enhanced user profiles (Principal, Faculty, Student)
- **subjects**: Course subjects assigned to faculty
- **attendance_sessions**: QR code sessions with expiry
- **attendance_records**: Student attendance records
- **leave_requests**: Leave applications and approvals

### Sample Data Included:
- 1 Principal (Dr. Rajesh Kumar)
- 2 Faculty members (Prof. Anita Sharma, Dr. Vikram Singh)
- 4 Students (Arjun, Priya, Rahul, Sneha)
- 3 Subjects (Data Structures, Algorithms, Calculus)

## 🌐 Production Deployment

### Environment Variables for Production:
```env
DATABASE_URL=supabase
SUPABASE_DB_HOST=db.your-project-ref.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-production-password
SUPABASE_DB_NAME=postgres
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
```

## 🔒 Security Best Practices

1. **Use Row Level Security (RLS)** in Supabase for additional protection
2. **Enable database backups** in Supabase settings
3. **Use strong passwords** for database access
4. **Keep environment variables secure**
5. **Monitor database usage** in Supabase dashboard

## 📈 Monitoring

### Supabase Dashboard Features:
- **Database**: View tables and data
- **Auth**: Manage user authentication (if using Supabase Auth)
- **Storage**: File storage (for future features)
- **Logs**: Monitor database queries and errors
- **Settings**: Backup, security, and billing

## 🆘 Need Help?

### Common Issues:
1. **"syntax error at AUTO_INCREMENT"**: You used MySQL schema instead of PostgreSQL
2. **"Connection refused"**: Check your connection details
3. **"Authentication failed"**: Verify your password
4. **"Table doesn't exist"**: Run the schema script again

### Support Resources:
- Supabase Documentation: https://supabase.com/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Project Issues: Create an issue in the GitHub repository

---

**Your Supabase database is now ready for production! 🎉**