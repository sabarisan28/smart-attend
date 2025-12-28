import React, { useState, useEffect } from 'react'
import { BookOpen, QrCode, Users, Calendar, TrendingUp, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'

const FacultyDashboard = () => {
  const [subjects, setSubjects] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [recentSessions, setRecentSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [subjectsRes, leaveRes] = await Promise.all([
        api.get('/faculty/subjects'),
        api.get('/faculty/leave-requests')
      ])

      setSubjects(subjectsRes.data.subjects)
      setLeaveRequests(leaveRes.data.leaveRequests)
      
      // Get recent attendance data for each subject
      const attendancePromises = subjectsRes.data.subjects.map(subject =>
        api.get(`/faculty/attendance/${subject.id}?month=${new Date().toISOString().slice(0, 7)}`)
      )
      
      const attendanceResults = await Promise.all(attendancePromises)
      const sessions = attendanceResults.flatMap(result => result.data.sessionSummary || [])
      setRecentSessions(sessions.slice(0, 5))
      
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveAction = async (leaveId, status) => {
    try {
      await api.put(`/faculty/leave/${leaveId}`, { status })
      toast.success(`Leave request ${status} successfully`)
      fetchData()
    } catch (error) {
      toast.error('Failed to update leave request')
    }
  }

  if (loading) {
    return <LoadingSpinner className="h-64" />
  }

  const pendingLeaveRequests = leaveRequests.filter(req => req.status === 'pending')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Faculty Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage attendance and leave requests</p>
        </div>
        <Link
          to="/faculty/qr-generator"
          className="btn-primary flex items-center"
        >
          <QrCode className="w-4 h-4 mr-2" />
          Generate QR Code
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Subjects</p>
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
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {recentSessions.length}
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
                  {pendingLeaveRequests.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Attendance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {recentSessions.reduce((sum, session) => sum + (session.attendance_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/faculty/qr-generator"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="card-body text-center">
            <QrCode className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Generate QR Code
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create QR codes for attendance marking
            </p>
          </div>
        </Link>

        <Link
          to="/attendance"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="card-body text-center">
            <BarChart className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              View Reports
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check attendance reports and analytics
            </p>
          </div>
        </Link>

        <Link
          to="/leave"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="card-body text-center">
            <Users className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Manage Leaves
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Review and approve leave requests
            </p>
          </div>
        </Link>
      </div>

      {/* My Subjects */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Subjects</h3>
        </div>
        <div className="card-body">
          {subjects.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No subjects assigned yet. Contact admin to assign subjects.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <div key={subject.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {subject.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Department: {subject.department}
                  </p>
                  <div className="flex space-x-2">
                    <Link
                      to={`/faculty/qr-generator?subject=${subject.id}`}
                      className="text-xs btn-primary"
                    >
                      Generate QR
                    </Link>
                    <Link
                      to={`/attendance?subject=${subject.id}`}
                      className="text-xs btn-secondary"
                    >
                      View Reports
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Sessions</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recentSessions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="session_date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Bar dataKey="attendance_count" fill="#3b82f6" name="Attendance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pending Leave Requests */}
      {pendingLeaveRequests.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Leave Requests ({pendingLeaveRequests.length})
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {pendingLeaveRequests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {request.student_name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(request.from_date).toLocaleDateString()} - {new Date(request.to_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {request.reason}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleLeaveAction(request.id, 'approved')}
                      className="btn-success text-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleLeaveAction(request.id, 'rejected')}
                      className="btn-danger text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {pendingLeaveRequests.length > 5 && (
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

export default FacultyDashboard