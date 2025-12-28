-- Smart Attendance & Leave Management System Database Schema
-- Run this SQL script in your Supabase MySQL database

-- Smart Attendance & Leave Management System Database Schema
-- Enhanced version with detailed user information

-- Create users table with comprehensive details
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('principal', 'faculty', 'student') NOT NULL,
    
    -- Personal Details
    phone_number VARCHAR(15),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    
    -- Institution Details
    institution_type ENUM('school', 'college') NOT NULL DEFAULT 'college',
    institution_name VARCHAR(200) NOT NULL,
    department VARCHAR(100),
    
    -- Academic Details (for students)
    education_level ENUM('primary', 'secondary', 'higher_secondary', 'ug', 'pg', 'phd') DEFAULT 'ug',
    course_type ENUM('arts', 'science', 'commerce', 'engineering', 'medical', 'law', 'management', 'other') DEFAULT 'science',
    year_of_study INT DEFAULT 1,
    semester INT DEFAULT 1,
    
    -- School specific (if institution_type = 'school')
    standard VARCHAR(10), -- Class/Grade (1st, 2nd, 10th, 12th etc.)
    section VARCHAR(10),   -- Section A, B, C etc.
    
    -- Faculty specific
    employee_id VARCHAR(50),
    designation VARCHAR(100),
    experience_years INT DEFAULT 0,
    qualification VARCHAR(200),
    
    -- System fields
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_role (role),
    INDEX idx_department (department),
    INDEX idx_email (email),
    INDEX idx_institution_type (institution_type),
    INDEX idx_education_level (education_level),
    INDEX idx_year_of_study (year_of_study)
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    faculty_id INT NOT NULL,
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_faculty_id (faculty_id),
    INDEX idx_department (department)
);

-- Create attendance_sessions table
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    faculty_id INT NOT NULL,
    session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    qr_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_subject_id (subject_id),
    INDEX idx_faculty_id (faculty_id),
    INDEX idx_qr_token (qr_token),
    INDEX idx_expires_at (expires_at)
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    student_id INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (session_id, student_id),
    INDEX idx_session_id (session_id),
    INDEX idx_student_id (student_id)
);

-- Create leave_requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    INDEX idx_dates (from_date, to_date)
);

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
ON DUPLICATE KEY UPDATE name = name;

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
ON DUPLICATE KEY UPDATE name = name;

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
ON DUPLICATE KEY UPDATE name = name;

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_attendance_sessions_date ON attendance_sessions(session_date);
CREATE INDEX idx_attendance_records_timestamp ON attendance_records(timestamp);
CREATE INDEX idx_leave_requests_created_at ON leave_requests(created_at);

-- Create view for attendance statistics
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
    ROUND((COUNT(ar.id) / COUNT(ats.id)) * 100, 2) as attendance_percentage
FROM users u
CROSS JOIN subjects s
LEFT JOIN attendance_sessions ats ON s.id = ats.subject_id
LEFT JOIN attendance_records ar ON ats.id = ar.session_id AND u.id = ar.student_id
WHERE u.role = 'student' AND s.department = u.department
GROUP BY u.id, s.id;

-- Create view for leave statistics
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
GROUP BY u.id;