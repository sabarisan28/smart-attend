const mysql = require('mysql2/promise');
require('dotenv').config();

let db = null;

// Check if we should use Supabase database
const useSupabase = process.env.DATABASE_URL !== 'mock' && 
  (process.env.SUPABASE_DB_HOST || process.env.DATABASE_URL?.startsWith('mysql://'));

if (useSupabase) {
  try {
    // Use Supabase configuration if available
    if (process.env.SUPABASE_DB_HOST) {
      console.log('🗄️ Connecting to Supabase MySQL database...');
      db = require('./supabaseDatabase');
    } else if (process.env.DATABASE_URL?.startsWith('mysql://')) {
      // Fallback to connection string
      const pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      // Test database connection
      const testConnection = async () => {
        try {
          const connection = await pool.getConnection();
          console.log('✅ MySQL database connected successfully');
          connection.release();
          db = pool;
        } catch (error) {
          console.error('❌ Database connection failed:', error.message);
          console.log('🔄 Falling back to mock database for development');
          db = require('./mockDatabase');
        }
      };

      testConnection();
    }
  } catch (error) {
    console.error('Failed to create database connection:', error.message);
    console.log('🔄 Using mock database for development');
    db = require('./mockDatabase');
  }
} else {
  console.log('📝 No real database configured - using mock database for development');
  console.log('💡 To use Supabase database, update DATABASE_URL or set SUPABASE_DB_* variables in .env file');
  console.log('🎯 Mock database includes enhanced user profiles');
  db = require('./mockDatabase');
}

module.exports = db;