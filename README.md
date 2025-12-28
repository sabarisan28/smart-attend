# Smart Attendance & Leave Management System

A comprehensive QR-based attendance and leave management system designed for colleges, built with React, Node.js, and MySQL.

## 🚀 Features

- **QR Code Attendance**: Faculty generates time-limited QR codes for attendance marking
- **Role-based Access**: Admin, Faculty, and Student roles with specific permissions
- **Leave Management**: Students can apply for leave, faculty can approve/reject
- **Analytics Dashboard**: Comprehensive attendance reports and analytics
- **Mobile Responsive**: Works seamlessly on all devices
- **Real-time Updates**: Live attendance tracking and notifications

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Recharts for analytics
- html5-qrcode for QR scanning

### Backend
- Node.js with Express.js
- JWT Authentication
- bcrypt for password hashing
- MySQL database (Supabase)
- RESTful API design

## 🎯 Quick Start

### Prerequisites
- Node.js 18+
- Git
- MySQL database (or Supabase account)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/sabarisan28/smart-atten.git
cd smart-atten
```

2. **Install dependencies:**
```bash
npm run install-all
```

3. **Set up environment variables:**
```bash
# Backend environment
cp backend/.env.example backend/.env
# Frontend environment  
cp frontend/.env.example frontend/.env
```

4. **Configure database:**
   - Create a Supabase project or local MySQL database
   - Update `backend/.env` with your database connection string
   - Run the SQL schema from `database/schema.sql`

5. **Start development servers:**
```bash
npm run dev
```

## 🔑 Default Credentials

### Demo Mode (Mock Database)
- **Principal**: principal@gmail.com / principal@123
- **Faculty**: faculty@gmail.com / faculty@123  
- **Student**: student@gmail.com / student@123

## 🌐 Live Demo

- **Frontend**: http://localhost:5173/
- **Backend API**: http://localhost:3000/

## 📱 Features Overview

### 👨‍💼 Principal Features
- Complete oversight of faculty and students
- View comprehensive user profiles with detailed information
- Department-wise statistics and analytics
- Monitor system-wide attendance trends
- Institutional management dashboard

### 👨‍🏫 Faculty Features
- Generate QR codes for attendance (5-minute expiry)
- View detailed student profiles in department
- Multiple QR code download and sharing options
- Approve/reject student leave requests
- Export attendance data to CSV
- Real-time attendance monitoring

### 👨‍🎓 Student Features
- **Multiple QR Scanning Methods:**
  - Camera scan (real-time)
  - Image upload (from device)
  - Manual token input (for testing)
- View personal attendance statistics
- Apply for leave with reasons
- Track leave request status
- Enhanced mobile interface

## 🗄️ Database Schema

The system uses the following main tables:
- `users` - User accounts with role-based access
- `subjects` - Course subjects assigned to faculty
- `attendance_sessions` - QR code sessions with expiry
- `attendance_records` - Student attendance records
- `leave_requests` - Leave applications and approvals

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Deploy Backend:**
   - Create new Vercel project
   - Set root directory to `backend`
   - Add environment variables
   - Deploy

2. **Deploy Frontend:**
   - Create new Vercel project  
   - Set root directory to `frontend`
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Add environment variables
   - Deploy

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=your_mysql_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
PORT=3000
```

#### Frontend (.env)
```
VITE_API_URL=your_backend_api_url
VITE_APP_NAME=Smart Attendance System
```

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- SQL injection prevention
- Input validation and sanitization
- Password hashing with bcrypt
- CORS protection
- Environment variable protection

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Admin Routes
- `POST /admin/faculty` - Create faculty account
- `GET /admin/analytics` - System analytics

### Faculty Routes
- `POST /faculty/qr-session` - Generate QR session
- `GET /faculty/attendance/:subjectId` - Get attendance reports
- `PUT /faculty/leave/:id` - Approve/reject leave

### Student Routes
- `POST /student/scan` - Mark attendance via QR
- `GET /student/attendance` - Get personal attendance
- `POST /student/leave` - Apply for leave

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: Toggle between themes
- **Toast Notifications**: Real-time feedback
- **Loading States**: Smooth user experience
- **Error Handling**: Graceful error management
- **Accessibility**: WCAG compliant

## 🧪 Testing

The system includes comprehensive demo data for testing:
- Sample users across all roles
- Pre-created subjects and sessions
- Mock attendance records
- Leave request examples

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for educational institutions
- Focused on user experience and security
- Scalable and maintainable architecture

## 📞 Support

For support, email sabarisan28@example.com or create an issue in this repository.

---

**Made with ❤️ for educational institutions**