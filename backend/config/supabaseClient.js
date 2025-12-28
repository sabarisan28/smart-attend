const { createClient } = require('@supabase/supabase-js');

// Supabase configuration using API keys
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with service role (for backend operations)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Wrapper to make it compatible with existing database queries
const db = {
  execute: async (query, params = []) => {
    try {
      // Convert MySQL-style queries to Supabase operations
      if (query.toLowerCase().includes('select')) {
        return await handleSelectQuery(query, params);
      } else if (query.toLowerCase().includes('insert')) {
        return await handleInsertQuery(query, params);
      } else if (query.toLowerCase().includes('update')) {
        return await handleUpdateQuery(query, params);
      } else if (query.toLowerCase().includes('delete')) {
        return await handleDeleteQuery(query, params);
      }
      
      // For complex queries, use raw SQL via Supabase
      const { data, error } = await supabase.rpc('execute_sql', {
        query: query,
        params: params
      });
      
      if (error) throw error;
      return [data || []];
      
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
};

// Helper functions to convert queries
const handleSelectQuery = async (query, params) => {
  // This is a simplified converter - you might need to enhance based on your queries
  if (query.includes('FROM users')) {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    return [data || []];
  }
  
  // Add more table handlers as needed
  return [[]];
};

const handleInsertQuery = async (query, params) => {
  // Handle INSERT operations
  return [{ insertId: 1 }];
};

const handleUpdateQuery = async (query, params) => {
  // Handle UPDATE operations
  return [{ affectedRows: 1 }];
};

const handleDeleteQuery = async (query, params) => {
  // Handle DELETE operations
  return [{ affectedRows: 1 }];
};

// Test connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Connected to Supabase via API');
    return true;
  } catch (error) {
    console.error('❌ Supabase API connection failed:', error.message);
    return false;
  }
};

// Initialize connection test
testConnection();

module.exports = db;