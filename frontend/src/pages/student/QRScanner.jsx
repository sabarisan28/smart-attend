import React, { useState, useEffect, useRef } from 'react'
import { QrCode, Camera, CheckCircle, XCircle, RefreshCw, Upload, FileImage } from 'lucide-react'
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5Qrcode } from 'html5-qrcode'
import api from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'

const QRScanner = () => {
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cameraAvailable, setCameraAvailable] = useState(null)
  const [permissionStatus, setPermissionStatus] = useState('unknown')
  const [recentAttendance, setRecentAttendance] = useState([])
  const [manualToken, setManualToken] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const fileInputRef = useRef(null)
  const scannerRef = useRef(null)
  const html5QrcodeScannerRef = useRef(null)

  useEffect(() => {
    fetchRecentAttendance()
    checkCameraAvailability()
    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(console.error)
      }
    }
  }, [])

  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setCameraAvailable(videoDevices.length > 0)
      
      // Check permission status if available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'camera' })
        setPermissionStatus(permission.state)
      }
    } catch (error) {
      console.error('Error checking camera:', error)
      setCameraAvailable(false)
    }
  }

  const fetchRecentAttendance = async () => {
    try {
      const response = await api.get('/student/attendance')
      setRecentAttendance(response.data.attendance.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch recent attendance')
    }
  }

  const startScanning = async () => {
    setScanning(true)
    setScanResult(null)

    try {
      // Check if camera is available
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      if (videoDevices.length === 0) {
        throw new Error('No camera found on this device')
      }

      // Request camera permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Prefer back camera for better QR scanning
        } 
      })
      
      // Stop the stream immediately as html5-qrcode will handle it
      stream.getTracks().forEach(track => track.stop())

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      }

      html5QrcodeScannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        config,
        false
      )

      html5QrcodeScannerRef.current.render(onScanSuccess, onScanFailure)
      toast.success('Camera started successfully!')
      
    } catch (error) {
      console.error('Camera access error:', error)
      setScanning(false)
      
      let errorMessage = 'Failed to access camera. '
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.'
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.'
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported in this browser.'
      } else {
        errorMessage += error.message || 'Please check your camera settings.'
      }
      
      toast.error(errorMessage)
    }
  }

  const stopScanning = async () => {
    if (html5QrcodeScannerRef.current) {
      try {
        await html5QrcodeScannerRef.current.clear()
        html5QrcodeScannerRef.current = null
        toast.info('Camera stopped')
      } catch (error) {
        console.error('Error stopping scanner:', error)
        html5QrcodeScannerRef.current = null
      }
    }
    setScanning(false)
  }

  const processQRData = async (qrData) => {
    setLoading(true)
    
    try {
      const response = await api.post('/student/scan', {
        qr_token: qrData
      })

      setScanResult({
        success: true,
        message: response.data.message,
        session: response.data.session
      })

      toast.success('Attendance marked successfully!')
      fetchRecentAttendance()
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to mark attendance'
      setScanResult({
        success: false,
        message: errorMessage
      })
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const onScanSuccess = async (decodedText, decodedResult) => {
    stopScanning()
    await processQRData(decodedText)
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!manualToken.trim()) {
      toast.error('Please enter a QR token')
      return
    }
    await processQRData(manualToken.trim())
    setManualToken('')
    setShowManualInput(false)
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploadedFile(file)
    setUploadLoading(true)

    try {
      // Create a temporary HTML5Qrcode instance for file scanning
      const html5QrCode = new Html5Qrcode("qr-file-reader")
      
      // Scan the uploaded file
      const qrCodeMessage = await html5QrCode.scanFile(file, true)
      
      toast.success('QR code detected in image!')
      await processQRData(qrCodeMessage)
      
      // Clean up
      setUploadedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
    } catch (error) {
      console.error('File scan error:', error)
      toast.error('Could not detect QR code in the image. Please try a clearer image.')
      setUploadedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } finally {
      setUploadLoading(false)
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const onScanFailure = (error) => {
    // Handle scan failure silently - this is called frequently during scanning
    console.log('Scan failed:', error)
  }

  const resetScanner = () => {
    setScanResult(null)
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">QR Code Scanner</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Scan QR codes to mark your attendance
        </p>
      </div>

      {/* Scanner Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Camera Scanner</h3>
        </div>
        <div className="card-body">
          {!scanning && !scanResult && !loading && !uploadLoading && (
            <div className="text-center py-8">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Choose how you want to scan QR codes
              </p>
              
              {/* Camera Status */}
              {cameraAvailable !== null && (
                <div className={`p-4 rounded-lg mb-6 text-left max-w-md mx-auto ${
                  cameraAvailable 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <h4 className={`font-semibold mb-2 ${
                    cameraAvailable 
                      ? 'text-green-900 dark:text-green-100' 
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    Camera Status: {cameraAvailable ? '✅ Available' : '❌ Not Available'}
                  </h4>
                  <p className={`text-sm ${
                    cameraAvailable 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {cameraAvailable 
                      ? 'Your device camera is ready for scanning'
                      : 'No camera detected on this device'
                    }
                  </p>
                  {permissionStatus !== 'unknown' && (
                    <p className={`text-xs mt-1 ${
                      cameraAvailable 
                        ? 'text-green-700 dark:text-green-300' 
                        : 'text-red-700 dark:text-red-300'
                    }`}>
                      Permission: {permissionStatus}
                    </p>
                  )}
                </div>
              )}
              
              {/* Scanning Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
                {/* Camera Scanning */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <Camera className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Camera Scan
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                    Use your device camera to scan QR codes in real-time
                  </p>
                  <button
                    onClick={startScanning}
                    disabled={cameraAvailable === false}
                    className={`w-full flex items-center justify-center ${
                      cameraAvailable === false 
                        ? 'btn-secondary opacity-50 cursor-not-allowed' 
                        : 'btn-primary'
                    }`}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {cameraAvailable === false ? 'Camera Not Available' : 'Start Camera'}
                  </button>
                </div>

                {/* File Upload */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                  <FileImage className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    Upload Image
                  </h3>
                  <p className="text-sm text-purple-800 dark:text-purple-200 mb-4">
                    Upload a QR code image from your device
                  </p>
                  <button
                    onClick={triggerFileUpload}
                    className="w-full btn-secondary flex items-center justify-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
              
              {/* Manual Input Option */}
              <div className="text-center">
                <button
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  {showManualInput ? 'Hide Manual Input' : 'Or enter QR token manually (for testing)'}
                </button>
                
                {showManualInput && (
                  <form onSubmit={handleManualSubmit} className="mt-4 max-w-md mx-auto">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={manualToken}
                        onChange={(e) => setManualToken(e.target.value)}
                        placeholder="Paste QR token here..."
                        className="input-field flex-1 text-sm"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary text-sm"
                      >
                        Submit
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Copy the token from the faculty QR code for testing
                    </p>
                  </form>
                )}
              </div>
            </div>
          )}

          {scanning && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Point your camera at the QR code displayed by your faculty
                </p>
              </div>
              <div id="qr-reader" className="mx-auto"></div>
              <div id="qr-file-reader" className="hidden"></div>
              <div className="text-center">
                <button
                  onClick={stopScanning}
                  className="btn-secondary"
                >
                  Stop Scanning
                </button>
              </div>
            </div>
          )}

          {uploadLoading && (
            <div className="text-center py-8">
              <LoadingSpinner className="mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Scanning uploaded image...
              </p>
              {uploadedFile && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Processing: {uploadedFile.name}
                </p>
              )}
            </div>
          )}

          {loading && !uploadLoading && (
            <div className="text-center py-8">
              <LoadingSpinner className="mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Processing attendance...
              </p>
            </div>
          )}

          {scanResult && (
            <div className="text-center py-8">
              {scanResult.success ? (
                <div className="space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-2">
                      Attendance Marked Successfully!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {scanResult.message}
                    </p>
                    {scanResult.session && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg inline-block">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>Subject:</strong> {scanResult.session.subject_name}
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>Faculty:</strong> {scanResult.session.faculty_name}
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>Time:</strong> {new Date(scanResult.session.timestamp).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                      Attendance Failed
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {scanResult.message}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={resetScanner}
                  className="btn-secondary flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Scan Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">How to Use</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Ways to Mark Attendance:</h4>
              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                <li><strong>Camera Scan:</strong> Click "Start Camera" and point at QR code</li>
                <li><strong>Upload Image:</strong> Click "Choose Image" and select QR code file</li>
                <li><strong>Manual Entry:</strong> Copy and paste QR token for testing</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tips for Better Results:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>Ensure QR code image is clear and well-lit</li>
                <li>Use PNG or JPG format for uploaded images</li>
                <li>Make sure QR code is not expired (5 min limit)</li>
                <li>Try different scanning methods if one fails</li>
                <li>Contact faculty if QR code doesn't work</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      {recentAttendance.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Attendance</h3>
          </div>
          <div className="card-body">
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
          </div>
        </div>
      )}

      {/* Troubleshooting */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Troubleshooting</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                Common Issues:
              </h4>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
                <li><strong>Camera not working:</strong> Try the "Upload Image" option instead</li>
                <li><strong>QR code not detected:</strong> Ensure image is clear and try different formats</li>
                <li><strong>"Invalid or expired QR code":</strong> Ask faculty to generate a new code</li>
                <li><strong>"Attendance already marked":</strong> You can only mark attendance once per session</li>
                <li><strong>Upload failed:</strong> Try a different image format (PNG/JPG) or smaller file size</li>
                <li><strong>Network error:</strong> Check internet connection and try again</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRScanner