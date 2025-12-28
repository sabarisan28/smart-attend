import React, { useState, useEffect } from 'react'
import { Calendar, Plus, Clock, CheckCircle, XCircle, FileText } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const LeaveManagement = () => {
  const { user } = useAuth()
  const [leaveRequests, setLeaveRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchLeaveRequests()
  }, [])

  const fetchLeaveRequests = async () => {
    try {
      const endpoint = user.role === 'faculty' ? '/faculty/leave-requests' : '/student/leave'
      const response = await api.get(endpoint)
      setLeaveRequests(response.data.leaveRequests)
    } catch (error) {
      toast.error('Failed to fetch leave requests')
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveAction = async (leaveId, status) => {
    try {
      await api.put(`/faculty/leave/${leaveId}`, { status })
      toast.success(`Leave request ${status} successfully`)
      fetchLeaveRequests()
    } catch (error) {
      toast.error('Failed to update leave request')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger'
    }
    return badges[status] || 'badge-info'
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const pendingRequests = leaveRequests.filter(req => req.status === 'pending')
  const processedRequests = leaveRequests.filter(req => req.status !== 'pending')

  if (loading) {
    return <LoadingSpinner className="h-64" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user.role === 'faculty' 
              ? 'Review and manage student leave requests' 
              : 'Apply for leave and track your requests'
            }
          </p>
        </div>
        {user.role === 'student' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Apply for Leave
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {pendingRequests.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Requests</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {leaveRequests.filter(req => req.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Approved</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {leaveRequests.filter(req => req.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Rejected</div>
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-500" />
              Pending Requests ({pendingRequests.length})
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {user.role === 'faculty' && (
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {request.student_name}
                        </h4>
                      )}
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(request.from_date).toLocaleDateString()} - {new Date(request.to_date).toLocaleDateString()}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {request.reason}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Applied on: {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`badge ${getStatusBadge(request.status)} flex items-center`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                      </span>
                      {user.role === 'faculty' && (
                        <div className="flex space-x-2">
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
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Requests */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            {user.role === 'faculty' ? 'All Leave Requests' : 'My Leave Requests'}
          </h3>
        </div>
        <div className="card-body">
          {leaveRequests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {user.role === 'faculty' 
                  ? 'No leave requests found' 
                  : 'You haven\'t applied for any leave yet'
                }
              </p>
              {user.role === 'student' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary mt-4"
                >
                  Apply for Leave
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    {user.role === 'faculty' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Student
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      From Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      To Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Applied On
                    </th>
                    {user.role === 'faculty' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {leaveRequests.map((request) => (
                    <tr key={request.id}>
                      {user.role === 'faculty' && (
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                          {request.student_name}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {new Date(request.from_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {new Date(request.to_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {request.reason}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`badge ${getStatusBadge(request.status)} flex items-center w-fit`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1">{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      {user.role === 'faculty' && (
                        <td className="px-4 py-3 text-sm">
                          {request.status === 'pending' ? (
                            <div className="flex space-x-2">
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
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Leave Modal */}
      {showCreateModal && user.role === 'student' && (
        <CreateLeaveModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchLeaveRequests()
          }}
        />
      )}
    </div>
  )
}

// Create Leave Modal Component
const CreateLeaveModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    from_date: '',
    to_date: '',
    reason: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (new Date(formData.to_date) < new Date(formData.from_date)) {
      toast.error('To date must be after from date')
      return
    }

    setLoading(true)
    try {
      await api.post('/student/leave', formData)
      toast.success('Leave request submitted successfully')
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit leave request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Apply for Leave</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From Date
            </label>
            <input
              type="date"
              required
              className="input-field"
              value={formData.from_date}
              onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To Date
            </label>
            <input
              type="date"
              required
              className="input-field"
              value={formData.to_date}
              onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
              min={formData.from_date || new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason
            </label>
            <textarea
              required
              rows={4}
              className="input-field"
              placeholder="Please provide a detailed reason for your leave..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              minLength={10}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.reason.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <LoadingSpinner size="sm" /> : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LeaveManagement