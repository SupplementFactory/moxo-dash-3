import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema setup function
export async function initializeDatabase() {
  try {
    // Create projects table if it doesn't exist
    const { error: projectsError } = await supabase.rpc('create_projects_table');
    if (projectsError && !projectsError.message.includes('already exists')) {
      console.error('Error creating projects table:', projectsError);
    }

    // Create auth table if it doesn't exist
    const { error: authError } = await supabase.rpc('create_auth_table');
    if (authError && !authError.message.includes('already exists')) {
      console.error('Error creating auth table:', authError);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Utility functions
export function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function generateProjectSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

