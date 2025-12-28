const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// Apply authentication and student authorization to all routes
router.use(authenticateToken);
router.use(authorizeRoles('student'));

// Scan QR code for attendance
router.post('/scan', validateRequest(schemas.scanQR), async (req, res) => {
  try {
    const { qr_token } = req.body;

    // Parse QR data if it's JSON
    let sessionData;
    try {
      sessionData = JSON.parse(qr_token);
    } catch {
      // If not JSON, treat as direct token
      sessionData = { token: qr_token };
    }

    const token = sessionData.token || qr_token;

    // Find valid session
    const [sessions] = await db.execute(`
      SELECT 
        s.id,
        s.subject_id,
        s.expires_at,
        sub.name as subject_name,
        u.name as faculty_name
      FROM attendance_sessions s
      JOIN subjects sub ON s.subject_id = sub.id
      JOIN users u ON s.faculty_id = u.id
      WHERE s.qr_token = ? AND s.expires_at > NOW()
    `, [token]);

    if (sessions.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired QR code' });
    }

    const session = sessions[0];

    // Check if student already marked attendance for this session
    const [existingAttendance] = await db.execute(
      'SELECT id FROM attendance_records WHERE session_id = ? AND student_id = ?',
      [session.id, req.user.id]
    );

    if (existingAttendance.length > 0) {
      return res.status(400).json({ error: 'Attendance already marked for this session' });
    }

    // Mark attendance
    await db.execute(
      'INSERT INTO attendance_records (session_id, student_id, timestamp) VALUES (?, ?, NOW())',
      [session.id, req.user.id]
    );

    res.json({
      message: 'Attendance marked successfully',
      session: {
        subject_name: session.subject_name,
        faculty_name: session.faculty_name,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Scan QR error:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Get student's attendance
router.get('/attendance', async (req, res) => {
  try {
    const { subject_id, month } = req.query;

    let subjectFilter = '';
    let dateFilter = '';
    let params = [req.user.id];

    if (subject_id) {
      subjectFilter = 'AND s.subject_id = ?';
      params.push(subject_id);
    }

    if (month) {
      dateFilter = 'AND DATE_FORMAT(s.session_date, "%Y-%m") = ?';
      params.push(month);
    }

    // Get attendance records
    const [attendance] = await db.execute(`
      SELECT 
        s.id as session_id,
        s.session_date,
        sub.name as subject_name,
        u.name as faculty_name,
        ar.timestamp as attendance_time,
        CASE WHEN ar.id IS NOT NULL THEN 'Present' ELSE 'Absent' END as status
      FROM attendance_sessions s
      JOIN subjects sub ON s.subject_id = sub.id
      JOIN users u ON s.faculty_id = u.id
      LEFT JOIN attendance_records ar ON s.id = ar.session_id AND ar.student_id = ?
      WHERE sub.department = ? ${subjectFilter} ${dateFilter}
      ORDER BY s.session_date DESC
    `, [req.user.id, req.user.department, ...params.slice(1)]);

    // Get attendance summary
    const [summary] = await db.execute(`
      SELECT 
        sub.id as subject_id,
        sub.name as subject_name,
        COUNT(s.id) as total_sessions,
        COUNT(ar.id) as attended_sessions,
        ROUND((COUNT(ar.id) / COUNT(s.id)) * 100, 2) as attendance_percentage
      FROM subjects sub
      JOIN attendance_sessions s ON sub.id = s.subject_id
      LEFT JOIN attendance_records ar ON s.id = ar.session_id AND ar.student_id = ?
      WHERE sub.department = ? ${subjectFilter.replace('s.subject_id', 'sub.id')} ${dateFilter.replace('s.session_date', 's.session_date')}
      GROUP BY sub.id, sub.name
      ORDER BY sub.name
    `, [req.user.id, req.user.department, ...params.slice(1)]);

    res.json({
      attendance,
      summary
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Apply for leave
router.post('/leave', validateRequest(schemas.leaveRequest), async (req, res) => {
  try {
    const { from_date, to_date, reason } = req.body;

    // Check for overlapping leave requests
    const [existingLeave] = await db.execute(`
      SELECT id FROM leave_requests 
      WHERE student_id = ? 
        AND status IN ('pending', 'approved')
        AND (
          (from_date <= ? AND to_date >= ?) OR
          (from_date <= ? AND to_date >= ?) OR
          (from_date >= ? AND to_date <= ?)
        )
    `, [req.user.id, from_date, from_date, to_date, to_date, from_date, to_date]);

    if (existingLeave.length > 0) {
      return res.status(400).json({ error: 'Leave request already exists for overlapping dates' });
    }

    // Insert leave request
    const [result] = await db.execute(
      'INSERT INTO leave_requests (student_id, from_date, to_date, reason, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, from_date, to_date, reason, 'pending']
    );

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leaveRequest: {
        id: result.insertId,
        from_date,
        to_date,
        reason,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Leave request error:', error);
    res.status(500).json({ error: 'Failed to submit leave request' });
  }
});

// Get student's leave requests
router.get('/leave', async (req, res) => {
  try {
    const [leaveRequests] = await db.execute(
      'SELECT id, from_date, to_date, reason, status, created_at FROM leave_requests WHERE student_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ leaveRequests });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
});

// Get available subjects for student's department
router.get('/subjects', async (req, res) => {
  try {
    const [subjects] = await db.execute(`
      SELECT 
        s.id,
        s.name,
        u.name as faculty_name
      FROM subjects s
      JOIN users u ON s.faculty_id = u.id
      WHERE s.department = ?
      ORDER BY s.name
    `, [req.user.department]);

    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

module.exports = router;