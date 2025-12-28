import React, { useState, useEffect } from 'react'
import { QrCode, Clock, RefreshCw, Download } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'

const QRGenerator = () => {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [qrSession, setQrSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    fetchSubjects()
    
    // Pre-select subject from URL params
    const subjectId = searchParams.get('subject')
    if (subjectId) {
      setSelectedSubject(subjectId)
    }
  }, [searchParams])

  useEffect(() => {
    let interval = null
    if (qrSession && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && qrSession) {
      setQrSession(null)
      toast.error('QR code has expired')
    }
    return () => clearInterval(interval)
  }, [timeLeft, qrSession])

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/faculty/subjects')
      setSubjects(response.data.subjects)
    } catch (error) {
      toast.error('Failed to fetch subjects')
    }
  }

  const generateQR = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/faculty/qr-session', {
        subject_id: parseInt(selectedSubject)
      })

      setQrSession(response.data.session)
      setTimeLeft(5 * 60) // 5 minutes in seconds
      toast.success('QR code generated successfully!')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }

  const downloadQR = () => {
    if (!qrSession?.qr_code) return

    const link = document.createElement('a')
    link.href = qrSession.qr_code
    link.download = `attendance-qr-${qrSession.subject_name}-${new Date().toISOString().slice(0, 10)}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">QR Code Generator</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate QR codes for student attendance marking
        </p>
      </div>

      {/* Subject Selection */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Subject</h3>
        </div>
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input-field"
                disabled={loading}
              >
                <option value="">Choose a subject...</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} - {subject.department}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={generateQR}
              disabled={loading || !selectedSubject}
              className="btn-primary flex items-center justify-center"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Display */}
      {qrSession && (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                QR Code - {qrSession.subject_name}
              </h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className={`font-mono ${timeLeft <= 60 ? 'text-red-600 dark:text-red-400' : ''}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <button
                  onClick={downloadQR}
                  className="btn-secondary text-sm flex items-center"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* QR Code */}
              <div className="flex-1 flex justify-center">
                <div className="bg-white p-6 rounded-lg shadow-inner">
                  <img
                    src={qrSession.qr_code}
                    alt="Attendance QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="flex-1 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Instructions for Students:
                  </h4>
                  <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                    <li>Open the Smart Attendance app</li>
                    <li>Go to "Scan QR Code" section</li>
                    <li>Point your camera at this QR code</li>
                    <li>Wait for confirmation message</li>
                  </ol>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    Important Notes:
                  </h4>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                    <li>QR code is valid for 5 minutes only</li>
                    <li>Each student can mark attendance only once</li>
                    <li>Keep the QR code visible to all students</li>
                    <li>Generate a new code if this one expires</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Session Details:
                  </h4>
                  <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                    <p><strong>Subject:</strong> {qrSession.subject_name}</p>
                    <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
                    <p><strong>Expires:</strong> {new Date(qrSession.expires_at).toLocaleString()}</p>
                    <p><strong>Session ID:</strong> {qrSession.id}</p>
                  </div>
                </div>

                {/* Testing Helper */}
                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    For Testing (Desktop):
                  </h4>
                  <div className="text-sm text-gray-800 dark:text-gray-200 space-y-2">
                    <p><strong>QR Token:</strong></p>
                    <div className="bg-white dark:bg-gray-800 p-2 rounded border font-mono text-xs break-all">
                      {qrSession.token}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(qrSession.token)}
                      className="btn-secondary text-xs"
                    >
                      Copy Token
                    </button>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Copy this token and paste it in the student manual input for testing
                    </p>
                  </div>
                </div>

                {/* Regenerate Button */}
                <button
                  onClick={generateQR}
                  disabled={loading}
                  className="w-full btn-secondary flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate New QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tips for Effective Usage</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Best Practices:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>Generate QR code at the start of class</li>
                <li>Display on projector or large screen</li>
                <li>Allow 2-3 minutes for all students to scan</li>
                <li>Monitor attendance in real-time</li>
                <li>Keep backup attendance method ready</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Troubleshooting:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>Ensure good lighting for scanning</li>
                <li>Check internet connectivity</li>
                <li>Regenerate if code expires</li>
                <li>Verify subject selection is correct</li>
                <li>Contact admin for technical issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRGenerator