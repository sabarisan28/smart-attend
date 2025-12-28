const mysql = require('mysql2/promise');

// Supabase MySQL connection configuration
const supabaseConfig = {
  host: process.env.SUPABASE_DB_HOST,
  port: process.env.SUPABASE_DB_PORT || 3306,
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(supabaseConfig);

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to Supabase MySQL database');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Supabase database connection failed:', error.message);
    return false;
  }
};

// Initialize connection
testConnection();

module.exports = pool;