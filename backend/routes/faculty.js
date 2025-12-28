const express = require('express');
const crypto = require('crypto');
const QRCode = require('qrcode');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// Apply authentication and faculty authorization to all routes
router.use(authenticateToken);
router.use(authorizeRoles('faculty'));

// Get students in faculty's department
router.get('/students', async (req, res) => {
  try {
    const [students] = await db.execute(`
      SELECT 
        id, name, email, phone_number, department,
        education_level, course_type, year_of_study, semester,
        address, city, state, pincode, date_of_birth, gender
      FROM users 
      WHERE role = 'student' AND department = ?
      ORDER BY year_of_study, name ASC
    `, [req.user.department]);

    res.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get faculty subjects
router.get('/subjects', async (req, res) => {
  try {
    const [subjects] = await db.execute(
      'SELECT id, name, department FROM subjects WHERE faculty_id = ? ORDER BY name',
      [req.user.id]
    );

    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Generate QR session
router.post('/qr-session', validateRequest(schemas.qrSession), async (req, res) => {
  try {
    const { subject_id } = req.body;

    // Verify subject belongs to faculty
    const [subjects] = await db.execute(
      'SELECT id, name FROM subjects WHERE id = ? AND faculty_id = ?',
      [subject_id, req.user.id]
    );

    if (subjects.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    // Generate unique token
    const qr_token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Insert session
    const [result] = await db.execute(
      'INSERT INTO attendance_sessions (subject_id, faculty_id, session_date, expires_at, qr_token) VALUES (?, ?, NOW(), ?, ?)',
      [subject_id, req.user.id, expires_at, qr_token]
    );

    // Generate QR code
    const qrData = JSON.stringify({
      session_id: result.insertId,
      token: qr_token,
      subject: subjects[0].name,
      expires_at: expires_at.toISOString()
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrData);

    res.json({
      message: 'QR session created successfully',
      session: {
        id: result.insertId,
        subject_name: subjects[0].name,
        expires_at,
        qr_code: qrCodeDataURL,
        token: qr_token
      }
    });
  } catch (error) {
    console.error('QR session error:', error);
    res.status(500).json({ error: 'Failed to create QR session' });
  }
});

// Get attendance for a subject
router.get('/attendance/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { date, month } = req.query;

    // Verify subject belongs to faculty
    const [subjects] = await db.execute(
      'SELECT id, name FROM subjects WHERE id = ? AND faculty_id = ?',
      [subjectId, req.user.id]
    );

    if (subjects.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    let dateFilter = '';
    let params = [subjectId];

    if (date) {
      dateFilter = 'AND DATE(s.session_date) = ?';
      params.push(date);
    } else if (month) {
      dateFilter = 'AND DATE_FORMAT(s.session_date, "%Y-%m") = ?';
      params.push(month);
    }

    // Get attendance records
    const [attendance] = await db.execute(`
      SELECT 
        s.id as session_id,
        s.session_date,
        u.id as student_id,
        u.name as student_name,
        u.email as student_email,
        ar.timestamp as attendance_time
      FROM attendance_sessions s
      LEFT JOIN attendance_records ar ON s.id = ar.session_id
      LEFT JOIN users u ON ar.student_id = u.id
      WHERE s.subject_id = ? ${dateFilter}
      ORDER BY s.session_date DESC, u.name ASC
    `, params);

    // Get session summary
    const [sessionSummary] = await db.execute(`
      SELECT 
        s.id,
        s.session_date,
        COUNT(ar.id) as attendance_count
      FROM attendance_sessions s
      LEFT JOIN attendance_records ar ON s.id = ar.session_id
      WHERE s.subject_id = ? ${dateFilter}
      GROUP BY s.id
      ORDER BY s.session_date DESC
    `, params);

    res.json({
      subject: subjects[0],
      attendance,
      sessionSummary
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get leave requests for faculty's subjects
router.get('/leave-requests', async (req, res) => {
  try {
    const [leaveRequests] = await db.execute(`
      SELECT DISTINCT
        lr.id,
        lr.from_date,
        lr.to_date,
        lr.reason,
        lr.status,
        lr.created_at,
        u.name as student_name,
        u.email as student_email,
        u.department
      FROM leave_requests lr
      JOIN users u ON lr.student_id = u.id
      WHERE u.department = ?
      ORDER BY lr.created_at DESC
    `, [req.user.department]);

    res.json({ leaveRequests });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// Approve/reject leave request
router.put('/leave/:id', validateRequest(schemas.leaveAction), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Verify leave request exists and is for faculty's department
    const [leaveRequests] = await db.execute(`
      SELECT lr.id, u.department
      FROM leave_requests lr
      JOIN users u ON lr.student_id = u.id
      WHERE lr.id = ? AND u.department = ?
    `, [id, req.user.department]);

    if (leaveRequests.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Update leave request status
    await db.execute(
      'UPDATE leave_requests SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ message: `Leave request ${status} successfully` });
  } catch (error) {
    console.error('Leave action error:', error);
    res.status(500).json({ error: 'Failed to update leave request' });
  }
});

// Export attendance to CSV
router.get('/export/:subjectId', async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { month } = req.query;

    // Verify subject belongs to faculty
    const [subjects] = await db.execute(
      'SELECT id, name FROM subjects WHERE id = ? AND faculty_id = ?',
      [subjectId, req.user.id]
    );

    if (subjects.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    let dateFilter = '';
    let params = [subjectId];

    if (month) {
      dateFilter = 'AND DATE_FORMAT(s.session_date, "%Y-%m") = ?';
      params.push(month);
    }

    // Get attendance data
    const [attendance] = await db.execute(`
      SELECT 
        u.name as student_name,
        u.email as student_email,
        DATE(s.session_date) as date,
        CASE WHEN ar.id IS NOT NULL THEN 'Present' ELSE 'Absent' END as status
      FROM users u
      CROSS JOIN attendance_sessions s
      LEFT JOIN attendance_records ar ON s.id = ar.session_id AND u.id = ar.student_id
      WHERE u.role = 'student' 
        AND u.department = ?
        AND s.subject_id = ? ${dateFilter}
      ORDER BY u.name, s.session_date
    `, [req.user.department, ...params]);

    // Convert to CSV format
    const csvHeader = 'Student Name,Email,Date,Status\n';
    const csvData = attendance.map(row => 
      `"${row.student_name}","${row.student_email}","${row.date}","${row.status}"`
    ).join('\n');

    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${subjects[0].name}_attendance.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export attendance' });
  }
});

module.exports = router;