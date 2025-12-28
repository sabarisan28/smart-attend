import React, { useState, useEffect } from 'react'
import { Users, GraduationCap, BookOpen, Calendar, TrendingUp, Phone, Mail, MapPin } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'

const PrincipalDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [faculty, setFaculty] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchDashboardData()
    fetchFaculty()
    fetchStudents()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/principal/dashboard')
      setDashboardData(response.data)
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
    }
  }

  const fetchFaculty = async () => {
    try {
      const response = await api.get('/principal/faculty')
      setFaculty(response.data.faculty)
    } catch (error) {
      toast.error('Failed to fetch faculty data')
    }
  }

  const fetchStudents = async () => {
    try {
      const response = await api.get('/principal/students')
      setStudents(response.data.students)
      setLoading(false)
    } catch (error) {
      toast.error('Failed to fetch students data')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Principal Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive overview of faculty and students
        </p>
      </div>

      {/* Stats Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Faculty</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.stats.faculty}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Students</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.stats.students}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                  <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subjects</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.stats.subjects}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                  <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Sessions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData.stats.todaySessions}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'faculty'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Faculty ({faculty.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'students'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Students ({students.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Stats */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Department Statistics</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {dashboardData.departmentStats.map((dept, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{dept.department}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Faculty: {dept.faculty_count} | Students: {dept.student_count}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Sessions</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {dashboardData.recentSessions.slice(0, 5).map((session, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{session.subject_name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{session.faculty_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.attendance_count} attended
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
      )}

      {/* Faculty Tab */}
      {activeTab === 'faculty' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Faculty Members</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {faculty.map((member) => (
                <div key={member.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.designation}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{member.department}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{member.phone_number}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="truncate">{member.city}, {member.state}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>ID:</strong> {member.employee_id}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>Experience:</strong> {member.experience_years} years
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>Qualification:</strong> {member.qualification}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Students</h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <div key={student.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <GraduationCap className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{student.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {student.education_level?.toUpperCase()} - {student.course_type}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">{student.department}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>{student.phone_number}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="truncate">{student.city}, {student.state}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>Year:</strong> {student.year_of_study} | <strong>Semester:</strong> {student.semester}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>DOB:</strong> {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        <strong>Gender:</strong> {student.gender || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrincipalDashboard