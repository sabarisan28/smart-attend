import React, { useState, useEffect } from 'react'
import { GraduationCap, Phone, Mail, MapPin, Calendar, User } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'

const FacultyStudents = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await api.get('/faculty/students')
      setStudents(response.data.students)
      setLoading(false)
    } catch (error) {
      toast.error('Failed to fetch students')
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = filterYear === '' || student.year_of_study.toString() === filterYear
    return matchesSearch && matchesYear
  })

  const uniqueYears = [...new Set(students.map(s => s.year_of_study))].sort()

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Students</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Students in your department
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="input-field"
              >
                <option value="">All Years</option>
                {uniqueYears.map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Students Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredStudents.length} of {students.length} students
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="card">
            <div className="card-body">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{student.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {student.education_level?.toUpperCase()} - {student.course_type}
                </p>
                <div className="flex items-center justify-center mt-1">
                  <span className="badge badge-primary">
                    Year {student.year_of_study} | Sem {student.semester}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="truncate">{student.email}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>{student.phone_number || 'Not provided'}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="truncate">
                    {student.city && student.state ? `${student.city}, ${student.state}` : 'Location not provided'}
                  </span>
                </div>
                
                {student.date_of_birth && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span>{new Date(student.date_of_birth).toLocaleDateString()}</span>
                  </div>
                )}
                
                {student.gender && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <User className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="capitalize">{student.gender}</span>
                  </div>
                )}
              </div>
              
              {student.address && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <strong>Address:</strong> {student.address}
                  </p>
                  {student.pincode && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <strong>Pincode:</strong> {student.pincode}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No students found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || filterYear ? 'Try adjusting your search filters.' : 'No students are assigned to your department yet.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default FacultyStudents