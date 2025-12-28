import React, { useState, useEffect } from 'react'
import { Users, BookOpen, Calendar, TrendingUp, Plus, Eye } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null)
  const [faculty, setFaculty] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateFaculty, setShowCreateFaculty] = useState(false)
  const [showCreateSubject, setShowCreateSubject] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [analyticsRes, facultyRes, subjectsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/faculty'),
        api.get('/admin/subjects')
      ])

      setAnalytics(analyticsRes.data)
      setFaculty(facultyRes.data.faculty)
      setSubjects(subjectsRes.data.subjects)
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner className="h-64" />
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your institution's attendance system</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCreateFaculty(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Faculty
          </button>
          <button
            onClick={() => setShowCreateSubject(true)}
            className="btn-secondary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.totals?.users || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.totals?.subjects || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.totals?.sessions || 0}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance Records</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analytics?.totals?.attendance || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Statistics */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Department Statistics</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics?.departmentStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#3b82f6" name="Students" />
                <Bar dataKey="faculty" fill="#10b981" name="Faculty" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Sessions</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {analytics?.recentSessions?.slice(0, 5).map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{session.subject_name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">by {session.faculty_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.attendance_count} students
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(session.session_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Faculty and Subjects Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faculty List */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Faculty Members</h3>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {faculty.slice(0, 5).map((member) => (
                    <tr key={member.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {member.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {member.department}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Subjects List */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subjects</h3>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Faculty
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {subjects.slice(0, 5).map((subject) => (
                    <tr key={subject.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {subject.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {subject.faculty_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create Faculty Modal */}
      {showCreateFaculty && (
        <CreateFacultyModal
          onClose={() => setShowCreateFaculty(false)}
          onSuccess={() => {
            setShowCreateFaculty(false)
            fetchData()
          }}
        />
      )}

      {/* Create Subject Modal */}
      {showCreateSubject && (
        <CreateSubjectModal
          faculty={faculty}
          onClose={() => setShowCreateSubject(false)}
          onSuccess={() => {
            setShowCreateSubject(false)
            fetchData()
          }}
        />
      )}
    </div>
  )
}

// Create Faculty Modal Component
const CreateFacultyModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  })
  const [loading, setLoading] = useState(false)

  const departments = [
    'Computer Science', 'Information Technology', 'Electronics', 'Mechanical',
    'Civil', 'Electrical', 'Chemical', 'Biotechnology', 'Mathematics',
    'Physics', 'Chemistry', 'English', 'Business Administration'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/admin/faculty', formData)
      toast.success('Faculty created successfully')
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create faculty')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Faculty Account</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="input-field"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <select
              required
              className="input-field"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <LoadingSpinner size="sm" /> : 'Create Faculty'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Create Subject Modal Component
const CreateSubjectModal = ({ faculty, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    faculty_id: '',
    department: ''
  })
  const [loading, setLoading] = useState(false)

  const departments = [
    'Computer Science', 'Information Technology', 'Electronics', 'Mechanical',
    'Civil', 'Electrical', 'Chemical', 'Biotechnology', 'Mathematics',
    'Physics', 'Chemistry', 'English', 'Business Administration'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/admin/subjects', formData)
      toast.success('Subject created successfully')
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create subject')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Subject</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject Name
            </label>
            <input
              type="text"
              required
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Faculty
            </label>
            <select
              required
              className="input-field"
              value={formData.faculty_id}
              onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
            >
              <option value="">Select Faculty</option>
              {faculty.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} - {member.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Department
            </label>
            <select
              required
              className="input-field"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <LoadingSpinner size="sm" /> : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminDashboard