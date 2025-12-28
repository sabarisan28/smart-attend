const express = require('express');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and principal authorization to all routes
router.use(authenticateToken);
router.use(authorizeRoles('principal'));

// Get all faculty members
router.get('/faculty', async (req, res) => {
  try {
    const [faculty] = await db.execute(`
      SELECT 
        id, name, email, phone_number, department, 
        employee_id, designation, qualification, experience_years,
        address, city, state, pincode, created_at
      FROM users 
      WHERE role = 'faculty' 
      ORDER BY name ASC
    `);

    res.json({ faculty });
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ error: 'Failed to fetch faculty' });
  }
});

// Get all students
router.get('/students', async (req, res) => {
  try {
    const [students] = await db.execute(`
      SELECT 
        id, name, email, phone_number, department,
        education_level, course_type, year_of_study, semester,
        standard, section, address, city, state, pincode,
        date_of_birth, gender, created_at
      FROM users 
      WHERE role = 'student' 
      ORDER BY department, year_of_study, name ASC
    `);

    res.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get counts
    const [facultyCount] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['faculty']
    );
    
    const [studentCount] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['student']
    );
    
    const [subjectCount] = await db.execute(
      'SELECT COUNT(*) as count FROM subjects'
    );
    
    const [sessionCount] = await db.execute(
      'SELECT COUNT(*) as count FROM attendance_sessions WHERE DATE(session_date) = CURDATE()'
    );

    // Get department-wise statistics
    const [departmentStats] = await db.execute(`
      SELECT 
        department,
        COUNT(CASE WHEN role = 'faculty' THEN 1 END) as faculty_count,
        COUNT(CASE WHEN role = 'student' THEN 1 END) as student_count
      FROM users 
      WHERE role IN ('faculty', 'student')
      GROUP BY department
      ORDER BY department
    `);

    // Get recent activities
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
      WHERE DATE(s.session_date) >= DATE_SUB(CURDATE(), INTERVAL 7 DAYS)
      GROUP BY s.id
      ORDER BY s.session_date DESC
      LIMIT 10
    `);

    res.json({
      stats: {
        faculty: facultyCount[0].count,
        students: studentCount[0].count,
        subjects: subjectCount[0].count,
        todaySessions: sessionCount[0].count
      },
      departmentStats,
      recentSessions
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get attendance overview
router.get('/attendance-overview', async (req, res) => {
  try {
    const { department, month } = req.query;
    
    let whereClause = '';
    let params = [];
    
    if (department) {
      whereClause += ' AND u.department = ?';
      params.push(department);
    }
    
    if (month) {
      whereClause += ' AND DATE_FORMAT(s.session_date, "%Y-%m") = ?';
      params.push(month);
    }

    const [attendanceData] = await db.execute(`
      SELECT 
        u.name as student_name,
        u.department,
        u.year_of_study,
        sub.name as subject_name,
        COUNT(s.id) as total_sessions,
        COUNT(ar.id) as attended_sessions,
        ROUND((COUNT(ar.id) / COUNT(s.id)) * 100, 2) as attendance_percentage
      FROM users u
      JOIN subjects sub ON u.department = sub.department
      LEFT JOIN attendance_sessions s ON sub.id = s.subject_id
      LEFT JOIN attendance_records ar ON s.id = ar.session_id AND u.id = ar.student_id
      WHERE u.role = 'student' ${whereClause}
      GROUP BY u.id, sub.id
      HAVING total_sessions > 0
      ORDER BY u.department, u.name, sub.name
    `, params);

    res.json({ attendanceData });
  } catch (error) {
    console.error('Attendance overview error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance overview' });
  }
});

module.exports = router;