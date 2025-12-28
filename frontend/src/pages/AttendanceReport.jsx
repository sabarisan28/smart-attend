import React, { useState, useEffect } from 'react'
import { Calendar, Download, Filter, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const AttendanceReport = () => {
  const { user } = useAuth()
  const [attendanceData, setAttendanceData] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [filters, setFilters] = useState({
    subject_id: '',
    month: new Date().toISOString().slice(0, 7)
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubjects()
    fetchAttendanceData()
  }, [])

  useEffect(() => {
    fetchAttendanceData()
  }, [filters])

  const fetchSubjects = async () => {
    try {
      const endpoint = user.role === 'faculty' ? '/faculty/subjects' : '/student/subjects'
      const response = await api.get(endpoint)
      setSubjects(response.data.subjects)
    } catch (error) {
      toast.error('Failed to fetch subjects')
    }
  }

  const fetchAttendanceData = async () => {
    setLoading(true)
    try {
      let endpoint = ''
      let params = new URLSearchParams()

      if (user.role === 'faculty') {
        if (filters.subject_id) {
          endpoint = `/faculty/attendance/${filters.subject_id}`
          if (filters.month) params.append('month', filters.month)
        } else {
          setLoading(false)
          return
        }
      } else {
        endpoint = '/student/attendance'
        if (filters.subject_id) params.append('subject_id', filters.subject_id)
        if (filters.month) params.append('month', filters.month)
      }

      const response = await api.get(`${endpoint}?${params.toString()}`)
      setAttendanceData(response.data)
    } catch (error) {
      toast.error('Failed to fetch attendance data')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = async () => {
    if (user.role !== 'faculty' || !filters.subject_id) {
      toast.error('CSV export is only available for faculty with selected subject')
      return
    }

    try {
      const params = new URLSearchParams()
      if (filters.month) params.append('month', filters.month)

      const response = await api.get(`/faculty/export/${filters.subject_id}?${params.toString()}`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `attendance-report-${filters.month || 'all'}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Report exported successfully!')
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  const getAttendanceChartData = () => {
    if (user.role === 'student') {
      return attendanceData?.summary?.map(subject => ({
        name: subject.subject_name,
        percentage: subject.attendance_percentage || 0,
        present: subject.attended_sessions || 0,
        total: subject.total_sessions || 0
      })) || []
    } else {
      // For faculty, group by date
      const sessionData = attendanceData?.sessionSummary || []
      return sessionData.map(session => ({
        date: new Date(session.session_date).toLocaleDateString(),
        attendance: session.attendance_count
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user.role === 'faculty' ? 'View and analyze class attendance' : 'Track your attendance progress'}
          </p>
        </div>
        {user.role === 'faculty' && filters.subject_id && (
          <button
            onClick={exportToCSV}
            className="btn-primary flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <select
                value={filters.subject_id}
                onChange={(e) => setFilters({ ...filters, subject_id: e.target.value })}
                className="input-field"
              >
                <option value="">
                  {user.role === 'faculty' ? 'Select a subject' : 'All subjects'}
                </option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                    {user.role === 'student' && ` - ${subject.faculty_name}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Month
              </label>
              <input
                type="month"
                value={filters.month}
                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner className="h-64" />
      ) : (
        <>
          {/* Summary Cards */}
          {user.role === 'student' && attendanceData?.summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <div className="card-body text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {attendanceData.summary.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Subjects</div>
                </div>
              </div>
              <div className="card">
                <div className="card-body text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {attendanceData.summary.reduce((sum, s) => sum + s.attended_sessions, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Classes Attended</div>
                </div>
              </div>
              <div className="card">
                <div className="card-body text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {attendanceData.summary.length > 0 
                      ? (attendanceData.summary.reduce((sum, s) => sum + (s.attendance_percentage || 0), 0) / attendanceData.summary.length).toFixed(1)
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Overall Attendance</div>
                </div>
              </div>
            </div>
          )}

          {user.role === 'faculty' && attendanceData?.sessionSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <div className="card-body text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {attendanceData.sessionSummary.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
                </div>
              </div>
              <div className="card">
                <div className="card-body text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {attendanceData.sessionSummary.reduce((sum, s) => sum + s.attendance_count, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Attendance</div>
                </div>
              </div>
              <div className="card">
                <div className="card-body text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {attendanceData.sessionSummary.length > 0 
                      ? (attendanceData.sessionSummary.reduce((sum, s) => sum + (s.attendance_count || 0), 0) / attendanceData.sessionSummary.length).toFixed(1)
                      : 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg per Session</div>
                </div>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                {user.role === 'student' ? 'Subject-wise Attendance' : 'Session Attendance Trend'}
              </h3>
            </div>
            <div className="card-body">
              {getAttendanceChartData().length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  {user.role === 'student' ? (
                    <BarChart data={getAttendanceChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="percentage" fill="#3b82f6" name="Attendance %" />
                    </BarChart>
                  ) : (
                    <LineChart data={getAttendanceChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  No data available for the selected filters
                </div>
              )}
            </div>
          </div>

          {/* Detailed Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.role === 'student' ? 'Attendance Records' : 'Session Details'}
              </h3>
            </div>
            <div className="card-body">
              <div className="overflow-x-auto">
                {user.role === 'student' ? (
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
                      {attendanceData?.attendance?.map((record, index) => (
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
                ) : (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Students Present
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {attendanceData?.sessionSummary?.map((session, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {new Date(session.session_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {session.attendance_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AttendanceReport