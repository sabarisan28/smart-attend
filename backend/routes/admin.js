const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validation');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Create faculty account
router.post('/faculty', validateRequest(schemas.createFaculty), async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    // Check if faculty already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Faculty already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert faculty
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'faculty', department]
    );

    res.status(201).json({
      message: 'Faculty created successfully',
      faculty: {
        id: result.insertId,
        name,
        email,
        department
      }
    });
  } catch (error) {
    console.error('Create faculty error:', error);
    res.status(500).json({ error: 'Failed to create faculty' });
  }
});

// Create subject
router.post('/subjects', validateRequest(schemas.createSubject), async (req, res) => {
  try {
    const { name, faculty_id, department } = req.body;

    // Verify faculty exists
    const [faculty] = await db.execute(
      'SELECT id FROM users WHERE id = ? AND role = ?',
      [faculty_id, 'faculty']
    );

    if (faculty.length === 0) {
      return res.status(400).json({ error: 'Faculty not found' });
    }

    // Insert subject
    const [result] = await db.execute(
      'INSERT INTO subjects (name, faculty_id, department) VALUES (?, ?, ?)',
      [name, faculty_id, department]
    );

    res.status(201).json({
      message: 'Subject created successfully',
      subject: {
        id: result.insertId,
        name,
        faculty_id,
        department
      }
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// Get all faculty
router.get('/faculty', async (req, res) => {
  try {
    const [faculty] = await db.execute(
      'SELECT id, name, email, department, created_at FROM users WHERE role = ? ORDER BY name',
      ['faculty']
    );

    res.json({ faculty });
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ error: 'Failed to fetch faculty' });
  }
});

// Get all subjects
router.get('/subjects', async (req, res) => {
  try {
    const [subjects] = await db.execute(`
      SELECT s.id, s.name, s.department, u.name as faculty_name, u.email as faculty_email
      FROM subjects s
      JOIN users u ON s.faculty_id = u.id
      ORDER BY s.name
    `);

    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Get system analytics
router.get('/analytics', async (req, res) => {
  try {
    // Get total counts
    const [totalUsers] = await db.execute('SELECT COUNT(*) as count FROM users');
    const [totalStudents] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = ?', ['student']);
    const [totalFaculty] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = ?', ['faculty']);
    const [totalSubjects] = await db.execute('SELECT COUNT(*) as count FROM subjects');
    const [totalSessions] = await db.execute('SELECT COUNT(*) as count FROM attendance_sessions');
    const [totalAttendance] = await db.execute('SELECT COUNT(*) as count FROM attendance_records');

    // Get recent attendance sessions
    const [recentSessions] = await db.execute(`
      SELECT 
        s.session_date,
        sub.name as subject_name,
        u.name as faculty_name,
        COUNT(ar.id) as attendance_count
      FROM attendance_sessions s
      JOIN subjects sub ON s.subject_id = sub.id
      JOIN users u ON s.faculty_id = u.id
      LEFT JOIN attendance_records ar ON s.id = ar.session_id
      WHERE s.session_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY s.id
      ORDER BY s.session_date DESC
      LIMIT 10
    `);

    // Get department-wise statistics
    const [departmentStats] = await db.execute(`
      SELECT 
        department,
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as students,
        SUM(CASE WHEN role = 'faculty' THEN 1 ELSE 0 END) as faculty
      FROM users
      WHERE role IN ('student', 'faculty')
      GROUP BY department
    `);

    res.json({
      totals: {
        users: totalUsers[0].count,
        students: totalStudents[0].count,
        faculty: totalFaculty[0].count,
        subjects: totalSubjects[0].count,
        sessions: totalSessions[0].count,
        attendance: totalAttendance[0].count
      },
      recentSessions,
      departmentStats
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;