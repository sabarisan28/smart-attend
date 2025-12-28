# Project Structure - Smart Attendance System

```
smart-attendance-system/
├── README.md                          # Main project documentation
├── DEPLOYMENT.md                      # Deployment guide
├── PROJECT_STRUCTURE.md              # This file
├── package.json                      # Root package.json for scripts
│
├── backend/                          # Node.js/Express Backend
│   ├── package.json                  # Backend dependencies
│   ├── vercel.json                   # Vercel deployment config
│   ├── .env.example                  # Environment variables template
│   ├── index.js                      # Main server file
│   │
│   ├── config/
│   │   └── database.js               # MySQL/Supabase connection
│   │
│   ├── middleware/
│   │   ├── auth.js                   # JWT authentication middleware
│   │   └── validation.js             # Request validation schemas
│   │
│   └── routes/
│       ├── auth.js                   # Authentication routes
│       ├── admin.js                  # Admin management routes
│       ├── faculty.js                # Faculty routes (QR, attendance)
│       └── student.js                # Student routes (scan, leave)
│
├── frontend/                         # React/Vite Frontend
│   ├── package.json                  # Frontend dependencies
│   ├── vercel.json                   # Vercel deployment config
│   ├── .env.example                  # Environment variables template
│   ├── index.html                    # HTML template
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   │
│   ├── public/                       # Static assets
│   │   └── vite.svg                  # Default Vite logo
│   │
│   └── src/
│       ├── main.jsx                  # React app entry point
│       ├── App.jsx                   # Main app component with routing
│       ├── index.css                 # Global styles with Tailwind
│       │
│       ├── components/               # Reusable components
│       │   ├── Layout.jsx            # Main layout with sidebar
│       │   ├── LoadingSpinner.jsx    # Loading spinner component
│       │   └── ProtectedRoute.jsx    # Route protection component
│       │
│       ├── contexts/                 # React contexts
│       │   ├── AuthContext.jsx       # Authentication context
│       │   └── ThemeContext.jsx      # Dark/light theme context
│       │
│       ├── services/                 # API services
│       │   └── api.js                # Axios configuration and interceptors
│       │
│       └── pages/                    # Page components
│           ├── Login.jsx             # Login page
│           ├── Register.jsx          # Registration page
│           ├── Profile.jsx           # User profile page
│           ├── AttendanceReport.jsx  # Attendance reports page
│           ├── LeaveManagement.jsx   # Leave management page
│           │
│           ├── admin/                # Admin pages
│           │   └── Dashboard.jsx     # Admin dashboard
│           │
│           ├── faculty/              # Faculty pages
│           │   ├── Dashboard.jsx     # Faculty dashboard
│           │   └── QRGenerator.jsx   # QR code generation page
│           │
│           └── student/              # Student pages
│               ├── Dashboard.jsx     # Student dashboard
│               └── QRScanner.jsx     # QR code scanning page
│
└── database/                         # Database files
    └── schema.sql                    # MySQL database schema
```

## Key Features by Directory

### Backend (`/backend`)

**Core Features:**
- JWT-based authentication with role-based access control
- RESTful API endpoints for all operations
- MySQL database integration via Supabase
- QR code generation with 5-minute expiry
- Input validation and sanitization
- Error handling and logging

**API Endpoints:**
- **Auth**: `/auth/login`, `/auth/register`
- **Admin**: `/admin/faculty`, `/admin/subjects`, `/admin/analytics`
- **Faculty**: `/faculty/qr-session`, `/faculty/attendance/:id`, `/faculty/leave/:id`
- **Student**: `/student/scan`, `/student/attendance`, `/student/leave`

### Frontend (`/frontend`)

**Core Features:**
- Responsive React application with Tailwind CSS
- Role-based dashboard routing
- QR code scanning using html5-qrcode
- Real-time attendance tracking
- Leave management system
- Dark/light theme support
- Mobile-friendly design

**Key Components:**
- **Layout**: Sidebar navigation with role-based menu items
- **Dashboards**: Separate dashboards for admin, faculty, and students
- **QR System**: Generation (faculty) and scanning (student) components
- **Reports**: Interactive charts using Recharts
- **Forms**: Comprehensive form handling with validation

### Database (`/database`)

**Tables:**
- **users**: User accounts with role-based access
- **subjects**: Course subjects assigned to faculty
- **attendance_sessions**: QR code sessions with expiry
- **attendance_records**: Student attendance records
- **leave_requests**: Leave applications and approvals

**Features:**
- Proper indexing for performance
- Foreign key constraints for data integrity
- Views for complex queries
- Default admin account setup

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (via Supabase)
- **Authentication**: JWT with bcrypt
- **Validation**: Joi
- **QR Generation**: qrcode library
- **Deployment**: Vercel Serverless Functions

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **QR Scanning**: html5-qrcode
- **Notifications**: react-hot-toast
- **Icons**: Lucide React
- **Deployment**: Vercel Static Hosting

### Database
- **Database**: MySQL
- **Hosting**: Supabase
- **Connection**: mysql2 with connection pooling

## Security Features

1. **Authentication**: JWT tokens with secure secret
2. **Authorization**: Role-based access control
3. **Input Validation**: Joi schemas for all inputs
4. **SQL Injection Prevention**: Parameterized queries
5. **Password Security**: bcrypt hashing
6. **CORS Protection**: Configured for specific origins
7. **Environment Variables**: Sensitive data protection

## Performance Optimizations

1. **Database**: Proper indexing and connection pooling
2. **Frontend**: Code splitting and lazy loading
3. **Caching**: Browser caching for static assets
4. **CDN**: Vercel's global CDN
5. **Bundle Size**: Optimized with Vite
6. **Images**: Optimized QR code generation

## Mobile Responsiveness

- Tailwind CSS responsive design
- Mobile-first approach
- Touch-friendly QR scanning
- Responsive navigation
- Optimized forms for mobile input

## Development Workflow

1. **Local Development**: 
   - Backend: `npm run dev` (nodemon)
   - Frontend: `npm run dev` (Vite dev server)

2. **Building**:
   - Frontend: `npm run build` (Vite build)
   - Backend: No build step required

3. **Deployment**:
   - Automatic deployment via Vercel Git integration
   - Environment variables configured in Vercel dashboard

## Scalability Considerations

1. **Database**: Supabase provides automatic scaling
2. **Backend**: Vercel serverless functions scale automatically
3. **Frontend**: Static hosting with global CDN
4. **Caching**: Can add Redis for session caching
5. **Load Balancing**: Handled by Vercel infrastructure

This structure provides a solid foundation for a production-ready attendance management system with room for future enhancements and scaling.