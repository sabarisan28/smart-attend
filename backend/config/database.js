const mysql = require('mysql2/promise');
require('dotenv').config();

let db = null;

// Check if we should use Supabase API
const useSupabaseAPI = process.env.DATABASE_URL !== 'mock' && 
  (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

// Check if we should use Supabase PostgreSQL direct connection
const useSupabaseDB = process.env.DATABASE_URL !== 'mock' && 
  (process.env.SUPABASE_DB_HOST || process.env.DATABASE_URL?.startsWith('postgresql://'));

if (useSupabaseAPI) {
  // Use Supabase JavaScript API (Recommended)
  console.log('🚀 Connecting to Supabase via API...');
  db = require('./supabaseClient');
} else if (useSupabaseDB) {
  try {
    // Use Supabase PostgreSQL direct connection
    if (process.env.SUPABASE_DB_HOST) {
      console.log('🗄️ Connecting to Supabase PostgreSQL database...');
      db = require('./supabaseDatabase');
    } else if (process.env.DATABASE_URL?.startsWith('postgresql://')) {
      // Fallback to connection string
      const { Pool } = require('pg');
      
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      // Test database connection
      const testConnection = async () => {
        try {
          const client = await pool.connect();
          console.log('✅ PostgreSQL database connected successfully');
          client.release();
        } catch (error) {
          console.error('❌ Database connection failed:', error.message);
          console.log('🔄 Falling back to mock database for development');
          db = require('./mockDatabase');
        }
      };

      // Wrapper to make it compatible with mysql2 syntax
      db = {
        execute: async (query, params = []) => {
          const client = await pool.connect();
          try {
            const result = await client.query(query, params);
            client.release();
            return [result.rows, result.fields];
          } catch (error) {
            client.release();
            throw error;
          }
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
  console.log('💡 To use Supabase API, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file');
  console.log('💡 To use Supabase DB, set SUPABASE_DB_* variables in .env file');
  console.log('🎯 Mock database includes enhanced user profiles');
  db = require('./mockDatabase');
}

module.exports = db;