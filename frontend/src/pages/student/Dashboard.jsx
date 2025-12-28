import React, { useState, useEffect } from 'react'
import { QrCode, BarChart3, Calendar, TrendingUp, Clock, BookOpen } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'

const StudentDashboard = () => {
  const [attendanceData, setAttendanceData] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [attendanceRes, subjectsRes, leaveRes] = await Promise.all([
        api.get('/student/attendance'),
        api.get('/student/subjects'),
        api.get('/student/leave')
      ])

      setAttendanceData(attendanceRes.data)
      setSubjects(subjectsRes.data.subjects)
      setLeaveRequests(leaveRes.data.leaveRequests)
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner className="h-64" />
  }

  const overallAttendance = attendanceData?.summary?.length > 0 
    ? attendanceData.summary.reduce((sum, subject) => sum + (subject.attendance_percentage || 0), 0) / attendanceData.summary.length
    : 0

  const recentAttendance = attendanceData?.attendance?.slice(0, 7) || []
  const pendingLeaves = leaveRequests.filter(req => req.status === 'pending').length

  const COLORS = ['#10b981', '#ef4444', '#f59e0b']

  const attendanceChartData = attendanceData?.summary?.map(subject => ({
    name: subject.subject_name,
    percentage: subject.attendance_percentage || 0,
    present: subject.attended_sessions || 0,
    total: subject.total_sessions || 0
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your attendance and manage leaves</p>
        </div>
        <Link
          to="/student/scan"
          className="btn-primary flex items-center"
        >
          <QrCode className="w-4 h-4 mr-2" />
          Scan QR Code
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Enrolled Subjects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subjects.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Attendance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overallAttendance.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Leaves</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingLeaves}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leaves</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {leaveRequests.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/student/scan"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="card-body text-center">
            <QrCode className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Scan QR Code
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Mark your attendance by scanning QR code
            </p>
          </div>
        </Link>

        <Link
          to="/attendance"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="card-body text-center">
            <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              View Attendance
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check your attendance records and statistics
            </p>
          </div>
        </Link>

        <Link
          to="/leave"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="card-body text-center">
            <Calendar className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Apply for Leave
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Submit leave applications and track status
            </p>
          </div>
        </Link>
      </div>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-wise Attendance */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subject-wise Attendance</h3>
          </div>
          <div className="card-body">
            {attendanceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#3b82f6" name="Attendance %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No attendance data available yet
              </p>
            )}
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Summary</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {attendanceData?.summary?.map((subject) => (
                <div key={subject.subject_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {subject.subject_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {subject.attended_sessions} / {subject.total_sessions} sessions
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      (subject.attendance_percentage || 0) >= 75 
                        ? 'text-green-600 dark:text-green-400'
                        : (subject.attendance_percentage || 0) >= 60
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {(subject.attendance_percentage || 0).toFixed(1)}%
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      (subject.attendance_percentage || 0) >= 75 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : (subject.attendance_percentage || 0) >= 60
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {(subject.attendance_percentage || 0) >= 75 ? 'Good' : (subject.attendance_percentage || 0) >= 60 ? 'Average' : 'Low'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Attendance</h3>
        </div>
        <div className="card-body">
          {recentAttendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentAttendance.map((record, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {new Date(record.session_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {record.subject_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {record.faculty_name}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`badge ${
                          record.status === 'Present' ? 'badge-success' : 'badge-danger'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {record.attendance_time 
                          ? new Date(record.attendance_time).toLocaleTimeString()
                          : '-'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No attendance records found
            </p>
          )}
        </div>
      </div>

      {/* Recent Leave Requests */}
      {leaveRequests.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Leave Requests</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {leaveRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(request.from_date).toLocaleDateString()} - {new Date(request.to_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {request.reason.length > 50 ? request.reason.substring(0, 50) + '...' : request.reason}
                    </p>
                  </div>
                  <span className={`badge ${
                    request.status === 'approved' ? 'badge-success' :
                    request.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                  }`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
            {leaveRequests.length > 3 && (
              <div className="mt-4 text-center">
                <Link to="/leave" className="text-primary-600 hover:text-primary-500 text-sm">
                  View all leave requests →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard