import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import PrincipalDashboard from './pages/principal/Dashboard'
import FacultyDashboard from './pages/faculty/Dashboard'
import FacultyStudents from './pages/faculty/Students'
import StudentDashboard from './pages/student/Dashboard'
import QRGenerator from './pages/faculty/QRGenerator'
import QRScanner from './pages/student/QRScanner'
import AttendanceReport from './pages/AttendanceReport'
import LeaveManagement from './pages/LeaveManagement'
import Profile from './pages/Profile'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* Dashboard routes based on role */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardRouter />} />
                
                {/* Principal routes */}
                <Route path="principal/*" element={
                  <ProtectedRoute allowedRoles={['principal']}>
                    <Routes>
                      <Route path="dashboard" element={<PrincipalDashboard />} />
                    </Routes>
                  </ProtectedRoute>
                } />
                
                {/* Faculty routes */}
                <Route path="faculty/*" element={
                  <ProtectedRoute allowedRoles={['faculty']}>
                    <Routes>
                      <Route path="dashboard" element={<FacultyDashboard />} />
                      <Route path="qr-generator" element={<QRGenerator />} />
                      <Route path="students" element={<FacultyStudents />} />
                    </Routes>
                  </ProtectedRoute>
                } />
                
                {/* Student routes */}
                <Route path="student/*" element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Routes>
                      <Route path="dashboard" element={<StudentDashboard />} />
                      <Route path="scan" element={<QRScanner />} />
                    </Routes>
                  </ProtectedRoute>
                } />
                
                {/* Common routes */}
                <Route path="attendance" element={<AttendanceReport />} />
                <Route path="leave" element={<LeaveManagement />} />
                <Route path="profile" element={<Profile />} />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

// Component to route to appropriate dashboard based on user role
function DashboardRouter() {
  const { user } = useAuth()
  
  if (!user) return <Navigate to="/login" replace />
  
  switch (user.role) {
    case 'principal':
      return <Navigate to="/principal/dashboard" replace />
    case 'faculty':
      return <Navigate to="/faculty/dashboard" replace />
    case 'student':
      return <Navigate to="/student/dashboard" replace />
    default:
      return <Navigate to="/login" replace />
  }
}

export default App