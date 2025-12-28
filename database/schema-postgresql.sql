-- Smart Attendance & Leave Management System Database Schema
-- PostgreSQL version for Supabase

-- Create users table with comprehensive details
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('principal', 'faculty', 'student')),
    
    -- Personal Details
    phone_number VARCHAR(15),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    
    -- Institution Details
    institution_type VARCHAR(20) NOT NULL DEFAULT 'college' CHECK (institution_type IN ('school', 'college')),
    institution_name VARCHAR(200) NOT NULL,
    department VARCHAR(100),
    
    -- Academic Details (for students)
    education_level VARCHAR(20) DEFAULT 'ug' CHECK (education_level IN ('primary', 'secondary', 'higher_secondary', 'ug', 'pg', 'phd')),
    course_type VARCHAR(20) DEFAULT 'science' CHECK (course_type IN ('arts', 'science', 'commerce', 'engineering', 'medical', 'law', 'management', 'other')),
    year_of_study INTEGER DEFAULT 1,
    semester INTEGER DEFAULT 1,
    
    -- School specific (if institution_type = 'school')
    standard VARCHAR(10), -- Class/Grade (1st, 2nd, 10th, 12th etc.)
    section VARCHAR(10),   -- Section A, B, C etc.
    
    -- Faculty specific
    employee_id VARCHAR(50),
    designation VARCHAR(100),
    experience_years INTEGER DEFAULT 0,
    qualification VARCHAR(200),
    
    -- System fields
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_institution_type ON users(institution_type);
CREATE INDEX IF NOT EXISTS idx_users_education_level ON users(education_level);
CREATE INDEX IF NOT EXISTS idx_users_year_of_study ON users(year_of_study);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    faculty_id INTEGER NOT NULL,
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for subjects table
CREATE INDEX IF NOT EXISTS idx_subjects_faculty_id ON subjects(faculty_id);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department);

-- Create attendance_sessions table
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL,
    faculty_id INTEGER NOT NULL,
    session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    qr_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for attendance_sessions table
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_subject_id ON attendance_sessions(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_faculty_id ON attendance_sessions(faculty_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_qr_token ON attendance_sessions(qr_token);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_expires_at ON attendance_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_date ON attendance_sessions(session_date);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (session_id, student_id)
);

-- Create indexes for attendance_records table
CREATE INDEX IF NOT EXISTS idx_attendance_records_session_id ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student_id ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_timestamp ON attendance_records(timestamp);

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for leave_requests table
CREATE INDEX IF NOT EXISTS idx_leave_requests_student_id ON leave_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(from_date, to_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_created_at ON leave_requests(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default users with enhanced details
-- Principal (password: principal@123)
INSERT INTO users (
    name, email, password, role, phone_number, 
    institution_type, institution_name, department, 
    employee_id, designation, qualification, experience_years
) VALUES 
('Dr. Rajesh Kumar', 'principal@gmail.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL9aK7K6.', 'principal', '+91-9876543210',
 'college', 'St. Xavier College of Engineering', 'Administration', 
 'PRIN001', 'Principal', 'Ph.D in Computer Science, M.Tech', 15)
ON CONFLICT (email) DO NOTHING;

-- Faculty (password: faculty@123)  
INSERT INTO users (
    name, email, password, role, phone_number,
    institution_type, institution_name, department,
    employee_id, designation, qualification, experience_years,
    address, city, state, pincode
) VALUES 
('Prof. Anita Sharma', 'faculty@gmail.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL9aK7K6.', 'faculty', '+91-9876543211',
 'college', 'St. Xavier College of Engineering', 'Computer Science',
 'FAC001', 'Associate Professor', 'M.Tech in Computer Science, B.Tech', 8,
 '123 Faculty Colony, College Road', 'Mumbai', 'Maharashtra', '400001')
ON CONFLICT (email) DO NOTHING;

-- Additional Faculty
INSERT INTO users (
    name, email, password, role, phone_number,
    institution_type, institution_name, department,
    employee_id, designation, qualification, experience_years,
    address, city, state, pincode
) VALUES 
('Dr. Vikram Singh', 'vikram.singh@college.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL9aK7K6.', 'faculty', '+91-9876543213',
 'college', 'St. Xavier College of Engineering', 'Mathematics',
 'FAC002', 'Professor', 'Ph.D in Mathematics, M.Sc', 12,
 '124 Faculty Colony, College Road', 'Mumbai', 'Maharashtra', '400001')
ON CONFLICT (email) DO NOTHING;

-- Student (password: student@123)
INSERT INTO users (
    name, email, password, role, phone_number,
    institution_type, institution_name, department,
    education_level, course_type, year_of_study, semester,
    address, city, state, pincode, date_of_birth, gender
) VALUES 
('Arjun Patel', 'student@gmail.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL9aK7K6.', 'student', '+91-9876543212',
 'college', 'St. Xavier College of Engineering', 'Computer Science',
 'ug', 'engineering', 2, 4,
 '456 Student Hostel, College Campus', 'Mumbai', 'Maharashtra', '400001', '2003-05-15', 'male')
ON CONFLICT (email) DO NOTHING;

-- Additional Students
INSERT INTO users (
    name, email, password, role, phone_number,
    institution_type, institution_name, department,
    education_level, course_type, year_of_study, semester,
    address, city, state, pincode, date_of_birth, gender
) VALUES 
('Priya Sharma', 'priya.sharma@college.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL9aK7K6.', 'student', '+91-9876543214',
 'college', 'St. Xavier College of Engineering', 'Computer Science',
 'ug', 'engineering', 2, 4,
 '457 Student Hostel, College Campus', 'Mumbai', 'Maharashtra', '400001', '2003-08-22', 'female'),
('Rahul Kumar', 'rahul.kumar@college.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL9aK7K6.', 'student', '+91-9876543215',
 'college', 'St. Xavier College of Engineering', 'Mathematics',
 'ug', 'science', 1, 2,
 '458 Student Hostel, College Campus', 'Mumbai', 'Maharashtra', '400001', '2004-01-10', 'male'),
('Sneha Reddy', 'sneha.reddy@college.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hL9aK7K6.', 'student', '+91-9876543216',
 'college', 'St. Xavier College of Engineering', 'Computer Science',
 'pg', 'engineering', 1, 2,
 '459 Student Hostel, College Campus', 'Mumbai', 'Maharashtra', '400001', '2001-12-05', 'female')
ON CONFLICT (email) DO NOTHING;

-- Insert sample subjects
INSERT INTO subjects (name, faculty_id, department) VALUES 
('Data Structures', 2, 'Computer Science'),
('Algorithms', 2, 'Computer Science'),
('Calculus', 3, 'Mathematics')
ON CONFLICT DO NOTHING;

-- Create views for statistics
CREATE OR REPLACE VIEW attendance_stats AS
SELECT 
    u.id as student_id,
    u.name as student_name,
    u.email as student_email,
    u.department,
    s.id as subject_id,
    s.name as subject_name,
    COUNT(ats.id) as total_sessions,
    COUNT(ar.id) as attended_sessions,
    ROUND((COUNT(ar.id)::DECIMAL / NULLIF(COUNT(ats.id), 0)) * 100, 2) as attendance_percentage
FROM users u
CROSS JOIN subjects s
LEFT JOIN attendance_sessions ats ON s.id = ats.subject_id
LEFT JOIN attendance_records ar ON ats.id = ar.session_id AND u.id = ar.student_id
WHERE u.role = 'student' AND s.department = u.department
GROUP BY u.id, u.name, u.email, u.department, s.id, s.name;

CREATE OR REPLACE VIEW leave_stats AS
SELECT 
    u.id as student_id,
    u.name as student_name,
    u.department,
    COUNT(lr.id) as total_requests,
    COUNT(CASE WHEN lr.status = 'approved' THEN 1 END) as approved_requests,
    COUNT(CASE WHEN lr.status = 'rejected' THEN 1 END) as rejected_requests,
    COUNT(CASE WHEN lr.status = 'pending' THEN 1 END) as pending_requests
FROM users u
LEFT JOIN leave_requests lr ON u.id = lr.student_id
WHERE u.role = 'student'
GROUP BY u.id, u.name, u.department;