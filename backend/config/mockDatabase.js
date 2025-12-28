// Mock database for local development
const bcrypt = require('bcryptjs');

// In-memory storage
let users = [];
let subjects = [];
let attendanceSessions = [];
let attendanceRecords = [];
let leaveRequests = [];

// Auto-increment IDs
let userIdCounter = 1;
let subjectIdCounter = 1;
let sessionIdCounter = 1;
let recordIdCounter = 1;
let leaveIdCounter = 1;

// Initialize with enhanced user data
const initializeData = async () => {
  if (users.length === 0) {
    try {
      // Create principal user
      const principalPassword = await bcrypt.hash('principal@123', 12);
      users.push({
        id: userIdCounter++,
        name: 'Dr. Rajesh Kumar',
        email: 'principal@gmail.com',
        password: principalPassword,
        role: 'principal',
        phone_number: '+91-9876543210',
        institution_type: 'college',
        institution_name: 'St. Xavier College of Engineering',
        department: 'Administration',
        employee_id: 'PRIN001',
        designation: 'Principal',
        qualification: 'Ph.D in Computer Science, M.Tech',
        experience_years: 15,
        address: '1 Principal Residence, College Campus',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        created_at: new Date()
      });
      
      // Create faculty users
      const facultyPassword = await bcrypt.hash('faculty@123', 12);
      users.push({
        id: userIdCounter++,
        name: 'Prof. Anita Sharma',
        email: 'faculty@gmail.com',
        password: facultyPassword,
        role: 'faculty',
        phone_number: '+91-9876543211',
        institution_type: 'college',
        institution_name: 'St. Xavier College of Engineering',
        department: 'Computer Science',
        employee_id: 'FAC001',
        designation: 'Associate Professor',
        qualification: 'M.Tech in Computer Science, B.Tech',
        experience_years: 8,
        address: '123 Faculty Colony, College Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        created_at: new Date()
      });

      users.push({
        id: userIdCounter++,
        name: 'Dr. Vikram Singh',
        email: 'vikram.singh@college.edu',
        password: facultyPassword,
        role: 'faculty',
        phone_number: '+91-9876543213',
        institution_type: 'college',
        institution_name: 'St. Xavier College of Engineering',
        department: 'Mathematics',
        employee_id: 'FAC002',
        designation: 'Professor',
        qualification: 'Ph.D in Mathematics, M.Sc',
        experience_years: 12,
        address: '124 Faculty Colony, College Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        created_at: new Date()
      });
      
      // Create student users
      const studentPassword = await bcrypt.hash('student@123', 12);
      users.push({
        id: userIdCounter++,
        name: 'Arjun Patel',
        email: 'student@gmail.com',
        password: studentPassword,
        role: 'student',
        phone_number: '+91-9876543212',
        institution_type: 'college',
        institution_name: 'St. Xavier College of Engineering',
        department: 'Computer Science',
        education_level: 'ug',
        course_type: 'engineering',
        year_of_study: 2,
        semester: 4,
        address: '456 Student Hostel, College Campus',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        date_of_birth: '2003-05-15',
        gender: 'male',
        created_at: new Date()
      });
      
      users.push({
        id: userIdCounter++,
        name: 'Priya Sharma',
        email: 'priya.sharma@college.edu',
        password: studentPassword,
        role: 'student',
        phone_number: '+91-9876543214',
        institution_type: 'college',
        institution_name: 'St. Xavier College of Engineering',
        department: 'Computer Science',
        education_level: 'ug',
        course_type: 'engineering',
        year_of_study: 2,
        semester: 4,
        address: '457 Student Hostel, College Campus',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        date_of_birth: '2003-08-22',
        gender: 'female',
        created_at: new Date()
      });

      users.push({
        id: userIdCounter++,
        name: 'Rahul Kumar',
        email: 'rahul.kumar@college.edu',
        password: studentPassword,
        role: 'student',
        phone_number: '+91-9876543215',
        institution_type: 'college',
        institution_name: 'St. Xavier College of Engineering',
        department: 'Mathematics',
        education_level: 'ug',
        course_type: 'science',
        year_of_study: 1,
        semester: 2,
        address: '458 Student Hostel, College Campus',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        date_of_birth: '2004-01-10',
        gender: 'male',
        created_at: new Date()
      });

      users.push({
        id: userIdCounter++,
        name: 'Sneha Reddy',
        email: 'sneha.reddy@college.edu',
        password: studentPassword,
        role: 'student',
        phone_number: '+91-9876543216',
        institution_type: 'college',
        institution_name: 'St. Xavier College of Engineering',
        department: 'Computer Science',
        education_level: 'pg',
        course_type: 'engineering',
        year_of_study: 1,
        semester: 2,
        address: '459 Student Hostel, College Campus',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        date_of_birth: '2001-12-05',
        gender: 'female',
        created_at: new Date()
      });
      
      // Create sample subjects
      subjects.push({
        id: subjectIdCounter++,
        name: 'Data Structures',
        faculty_id: 2, // Prof. Anita Sharma
        department: 'Computer Science',
        created_at: new Date()
      });
      
      subjects.push({
        id: subjectIdCounter++,
        name: 'Algorithms',
        faculty_id: 2, // Prof. Anita Sharma
        department: 'Computer Science',
        created_at: new Date()
      });

      subjects.push({
        id: subjectIdCounter++,
        name: 'Calculus',
        faculty_id: 3, // Dr. Vikram Singh
        department: 'Mathematics',
        created_at: new Date()
      });
      
      // Create sample attendance sessions
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      attendanceSessions.push({
        id: sessionIdCounter++,
        subject_id: 1,
        faculty_id: 2,
        session_date: yesterday,
        expires_at: new Date(yesterday.getTime() + 5 * 60 * 1000),
        qr_token: 'sample_token_1',
        created_at: yesterday
      });
      
      // Create sample attendance records
      attendanceRecords.push({
        id: recordIdCounter++,
        session_id: 1,
        student_id: 4, // Arjun
        timestamp: yesterday,
        created_at: yesterday
      });
      
      attendanceRecords.push({
        id: recordIdCounter++,
        session_id: 1,
        student_id: 5, // Priya
        timestamp: yesterday,
        created_at: yesterday
      });
      
      console.log('✅ Enhanced mock database initialized with detailed user data');
      console.log('🔑 Login credentials:');
      console.log('   Principal: principal@gmail.com / principal@123');
      console.log('   Faculty: faculty@gmail.com / faculty@123');
      console.log('   Student: student@gmail.com / student@123');
    } catch (error) {
      console.error('Error initializing mock database:', error);
    }
  }
};

// Mock database operations
const mockDb = {
  // Execute query simulation
  execute: async (query, params = []) => {
    const queryLower = query.toLowerCase().trim();
    
    try {
      // SELECT queries
      if (queryLower.startsWith('select')) {
        if (queryLower.includes('from users')) {
          if (queryLower.includes('where email = ?')) {
            const email = params[0];
            const user = users.find(u => u.email === email);
            return [user ? [user] : []];
          }
          if (queryLower.includes('where id = ?')) {
            const id = parseInt(params[0]);
            const user = users.find(u => u.id === id);
            return [user ? [user] : []];
          }
          if (queryLower.includes('where role = ?')) {
            const role = params[0];
            const filteredUsers = users.filter(u => u.role === role);
            return [filteredUsers];
          }
          // Get all users
          return [users];
        }
        
        if (queryLower.includes('from subjects')) {
          if (queryLower.includes('where faculty_id = ?')) {
            const facultyId = parseInt(params[0]);
            const userSubjects = subjects.filter(s => s.faculty_id === facultyId);
            return [userSubjects];
          }
          if (queryLower.includes('where department = ?')) {
            const department = params[0];
            const deptSubjects = subjects.filter(s => s.department === department);
            return [deptSubjects];
          }
          if (queryLower.includes('join users u on')) {
            // Subjects with faculty info for students
            const department = params[0];
            const subjectsWithFaculty = subjects
              .filter(s => s.department === department)
              .map(subject => {
                const faculty = users.find(u => u.id === subject.faculty_id);
                return {
                  id: subject.id,
                  name: subject.name,
                  faculty_name: faculty?.name || 'Unknown'
                };
              });
            return [subjectsWithFaculty];
          }
          // Get all subjects with faculty info
          const subjectsWithFaculty = subjects.map(subject => {
            const faculty = users.find(u => u.id === subject.faculty_id);
            return {
              ...subject,
              faculty_name: faculty?.name || 'Unknown',
              faculty_email: faculty?.email || 'Unknown'
            };
          });
          return [subjectsWithFaculty];
        }
        
        if (queryLower.includes('from attendance_sessions')) {
          if (queryLower.includes('where qr_token = ?')) {
            const token = params[0];
            const session = attendanceSessions.find(s => s.qr_token === token && new Date(s.expires_at) > new Date());
            if (session) {
              const subject = subjects.find(sub => sub.id === session.subject_id);
              const faculty = users.find(u => u.id === session.faculty_id);
              return [[{
                ...session,
                subject_name: subject?.name || 'Unknown',
                faculty_name: faculty?.name || 'Unknown'
              }]];
            }
            return [[]];
          }
          return [attendanceSessions];
        }
        
        if (queryLower.includes('from attendance_records')) {
          if (queryLower.includes('where session_id = ? and student_id = ?')) {
            const [sessionId, studentId] = params.map(p => parseInt(p));
            const record = attendanceRecords.find(r => r.session_id === sessionId && r.student_id === studentId);
            return [record ? [record] : []];
          }
          return [attendanceRecords];
        }
        
        if (queryLower.includes('from leave_requests')) {
          if (queryLower.includes('where student_id = ?')) {
            const studentId = parseInt(params[0]);
            const studentLeaves = leaveRequests.filter(lr => lr.student_id === studentId);
            return [studentLeaves];
          }
          return [leaveRequests];
        }
        
        // Student attendance queries
        if (queryLower.includes('attendance_sessions s') && queryLower.includes('join subjects sub')) {
          // Student attendance records query
          const studentId = params[0];
          const department = params[1];
          
          const studentAttendance = attendanceSessions.map(session => {
            const subject = subjects.find(s => s.id === session.subject_id);
            const faculty = users.find(u => u.id === session.faculty_id);
            const attendanceRecord = attendanceRecords.find(r => r.session_id === session.id && r.student_id === studentId);
            
            if (subject && subject.department === department) {
              return {
                session_id: session.id,
                session_date: session.session_date,
                subject_name: subject.name,
                faculty_name: faculty?.name || 'Unknown',
                attendance_time: attendanceRecord?.timestamp || null,
                status: attendanceRecord ? 'Present' : 'Absent'
              };
            }
            return null;
          }).filter(Boolean);
          
          return [studentAttendance];
        }
        
        if (queryLower.includes('subjects sub') && queryLower.includes('group by sub.id')) {
          // Student attendance summary query
          const studentId = params[0];
          const department = params[1];
          
          const studentSummary = subjects.filter(s => s.department === department).map(subject => {
            const subjectSessions = attendanceSessions.filter(s => s.subject_id === subject.id);
            const attendedSessions = attendanceRecords.filter(r => 
              r.student_id === studentId && 
              subjectSessions.some(s => s.id === r.session_id)
            );
            
            const totalSessions = subjectSessions.length;
            const attendedCount = attendedSessions.length;
            const percentage = totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100 * 100) / 100 : 0;
            
            return {
              subject_id: subject.id,
              subject_name: subject.name,
              total_sessions: totalSessions,
              attended_sessions: attendedCount,
              attendance_percentage: percentage
            };
          });
          
          return [studentSummary];
        }
        if (queryLower.includes('recent sessions') || queryLower.includes('attendance_sessions s')) {
          // Recent sessions query
          const recentSessions = attendanceSessions.slice(-10).map(session => {
            const subject = subjects.find(s => s.id === session.subject_id);
            const faculty = users.find(u => u.id === session.faculty_id);
            const attendanceCount = attendanceRecords.filter(r => r.session_id === session.id).length;
            
            return {
              session_date: session.session_date,
              subject_name: subject?.name || 'Unknown',
              faculty_name: faculty?.name || 'Unknown',
              attendance_count: attendanceCount
            };
          });
          return [recentSessions];
        }
        
        if (queryLower.includes('group by department')) {
          // Department statistics query
          const departments = [...new Set(users.map(u => u.department))];
          const departmentStats = departments.map(dept => {
            const deptUsers = users.filter(u => u.department === dept && ['student', 'faculty'].includes(u.role));
            return {
              department: dept,
              total_users: deptUsers.length,
              students: deptUsers.filter(u => u.role === 'student').length,
              faculty: deptUsers.filter(u => u.role === 'faculty').length
            };
          });
          return [departmentStats];
        }
        if (queryLower.includes('count(*)')) {
          if (queryLower.includes('from users')) {
            if (queryLower.includes('where role = ?')) {
              const role = params[0];
              const count = users.filter(u => u.role === role).length;
              return [[{ count }]];
            }
            return [[{ count: users.length }]];
          }
          if (queryLower.includes('from subjects')) {
            return [[{ count: subjects.length }]];
          }
          if (queryLower.includes('from attendance_sessions')) {
            return [[{ count: attendanceSessions.length }]];
          }
          if (queryLower.includes('from attendance_records')) {
            return [[{ count: attendanceRecords.length }]];
          }
        }
      }
      
      // INSERT queries
      if (queryLower.startsWith('insert')) {
        if (queryLower.includes('into users')) {
          const [name, email, password, role, department] = params;
          const newUser = {
            id: userIdCounter++,
            name,
            email,
            password,
            role,
            department,
            created_at: new Date()
          };
          users.push(newUser);
          return [{ insertId: newUser.id }];
        }
        
        if (queryLower.includes('into subjects')) {
          const [name, faculty_id, department] = params;
          const newSubject = {
            id: subjectIdCounter++,
            name,
            faculty_id: parseInt(faculty_id),
            department,
            created_at: new Date()
          };
          subjects.push(newSubject);
          return [{ insertId: newSubject.id }];
        }
        
        if (queryLower.includes('into attendance_sessions')) {
          const [subject_id, faculty_id, session_date, expires_at, qr_token] = params;
          const newSession = {
            id: sessionIdCounter++,
            subject_id: parseInt(subject_id),
            faculty_id: parseInt(faculty_id),
            session_date: new Date(),
            expires_at,
            qr_token,
            created_at: new Date()
          };
          attendanceSessions.push(newSession);
          return [{ insertId: newSession.id }];
        }
        
        if (queryLower.includes('into attendance_records')) {
          const [session_id, student_id, timestamp] = params;
          const newRecord = {
            id: recordIdCounter++,
            session_id: parseInt(session_id),
            student_id: parseInt(student_id),
            timestamp: new Date(),
            created_at: new Date()
          };
          attendanceRecords.push(newRecord);
          return [{ insertId: newRecord.id }];
        }
        
        if (queryLower.includes('into leave_requests')) {
          const [student_id, from_date, to_date, reason, status] = params;
          const newLeave = {
            id: leaveIdCounter++,
            student_id: parseInt(student_id),
            from_date,
            to_date,
            reason,
            status,
            created_at: new Date()
          };
          leaveRequests.push(newLeave);
          return [{ insertId: newLeave.id }];
        }
      }
      
      // UPDATE queries
      if (queryLower.startsWith('update')) {
        if (queryLower.includes('leave_requests') && queryLower.includes('set status = ?')) {
          const [status, id] = params;
          const leaveIndex = leaveRequests.findIndex(lr => lr.id === parseInt(id));
          if (leaveIndex !== -1) {
            leaveRequests[leaveIndex].status = status;
            return [{ affectedRows: 1 }];
          }
        }
      }
      
      // Default return for unhandled queries
      return [[]];
    } catch (error) {
      console.error('Mock database error:', error);
      throw error;
    }
  }
};

// Initialize data on module load
initializeData();

module.exports = mockDb;