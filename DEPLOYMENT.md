# Deployment Guide - Smart Attendance System

This guide will help you deploy the Smart Attendance & Leave Management System on Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
3. **Git Repository**: Push your code to GitHub, GitLab, or Bitbucket

## Database Setup (Supabase)

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project name: "smart-attendance"
5. Enter database password (save this!)
6. Select region closest to your users
7. Click "Create new project"

### 2. Set up Database Schema
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `database/schema.sql`
3. Click "Run" to execute the schema
4. Verify tables are created in the Table Editor

### 3. Get Database Connection String
1. Go to Settings → Database
2. Copy the connection string under "Connection string"
3. Replace `[YOUR-PASSWORD]` with your database password
4. Save this connection string for later

## Backend Deployment

### 1. Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Set **Root Directory** to `backend`
5. Keep other settings as default
6. Click "Deploy"

### 2. Configure Environment Variables
After deployment, go to your project settings:

1. Go to Settings → Environment Variables
2. Add the following variables:

```
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
NODE_ENV=production
PORT=3000
```

**Important**: 
- Replace `your_supabase_connection_string` with the actual connection string from Supabase
- Generate a strong JWT secret (at least 32 characters)

### 3. Redeploy
1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. Wait for deployment to complete
4. Note down your backend URL (e.g., `https://your-backend.vercel.app`)

## Frontend Deployment

### 1. Deploy to Vercel
1. Create a new Vercel project
2. Import the same Git repository
3. Set **Root Directory** to `frontend`
4. Set **Build Command** to `npm run build`
5. Set **Output Directory** to `dist`
6. Click "Deploy"

### 2. Configure Environment Variables
1. Go to Settings → Environment Variables
2. Add the following variables:

```
VITE_API_URL=https://your-backend.vercel.app
VITE_APP_NAME=Smart Attendance System
```

**Important**: Replace `https://your-backend.vercel.app` with your actual backend URL

### 3. Redeploy
1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. Wait for deployment to complete

## Post-Deployment Setup

### 1. Test the Application
1. Visit your frontend URL
2. Try logging in with the default admin credentials:
   - Email: `admin@college.edu`
   - Password: `admin123`

### 2. Create Initial Data
1. Login as admin
2. Create faculty accounts
3. Create subjects and assign to faculty
4. Faculty can then generate QR codes
5. Students can register and scan QR codes

### 3. Configure CORS (if needed)
If you encounter CORS issues:
1. Update the CORS configuration in `backend/index.js`
2. Add your frontend domain to the allowed origins
3. Redeploy the backend

## Domain Configuration (Optional)

### Custom Domain for Frontend
1. Go to your frontend project settings
2. Click "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

### Custom Domain for Backend
1. Go to your backend project settings
2. Click "Domains"
3. Add your custom domain
4. Update the `VITE_API_URL` in frontend environment variables
5. Redeploy frontend

## Monitoring and Maintenance

### 1. Monitor Logs
- Check Vercel function logs for errors
- Monitor Supabase logs for database issues

### 2. Database Maintenance
- Regularly backup your Supabase database
- Monitor database usage and upgrade plan if needed

### 3. Security
- Rotate JWT secrets periodically
- Monitor for suspicious activity
- Keep dependencies updated

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify DATABASE_URL is correct
   - Check Supabase project is active
   - Ensure password is correct in connection string

2. **CORS Errors**
   - Add frontend domain to CORS configuration
   - Redeploy backend after changes

3. **Environment Variables Not Working**
   - Ensure variables are set in Vercel dashboard
   - Redeploy after adding variables
   - Check variable names match exactly

4. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are listed in package.json
   - Check build logs for specific errors

### Getting Help

1. Check Vercel documentation
2. Check Supabase documentation
3. Review application logs
4. Check GitHub issues for similar problems

## Production Checklist

- [ ] Database schema deployed
- [ ] Backend deployed with environment variables
- [ ] Frontend deployed with correct API URL
- [ ] Default admin account accessible
- [ ] Faculty can create QR codes
- [ ] Students can scan QR codes
- [ ] Leave management working
- [ ] Reports generating correctly
- [ ] Mobile responsive design working
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Error monitoring set up
- [ ] Backup strategy in place

## Performance Optimization

1. **Database Indexing**: Ensure proper indexes are in place (already included in schema)
2. **Caching**: Consider implementing Redis for session caching
3. **CDN**: Vercel automatically provides CDN for static assets
4. **Image Optimization**: Use Vercel's image optimization for any images
5. **Bundle Analysis**: Use `npm run build` to analyze bundle size

Your Smart Attendance System is now ready for production use!