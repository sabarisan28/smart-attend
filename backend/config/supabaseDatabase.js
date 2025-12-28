const { Pool } = require('pg');

// Supabase PostgreSQL connection configuration
const supabaseConfig = {
  host: process.env.SUPABASE_DB_HOST,
  port: process.env.SUPABASE_DB_PORT || 5432,
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(supabaseConfig);

// Test connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Supabase PostgreSQL database');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Supabase database connection failed:', error.message);
    return false;
  }
};

// Initialize connection
testConnection();

// Wrapper to make it compatible with mysql2 syntax
const db = {
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

module.exports = db;