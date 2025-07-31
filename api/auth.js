import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, password, projectSlug } = req.body;

    if (type === 'company') {
      return await handleCompanyAuth(password, res);
    } else if (type === 'client') {
      return await handleClientAuth(projectSlug, password, res);
    } else {
      return res.status(400).json({ error: 'Invalid auth type' });
    }
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Company dashboard authentication
async function handleCompanyAuth(password, res) {
  const companyPassword = process.env.COMPANY_PASSWORD || 'supplement2024';
  
  if (password === companyPassword) {
    return res.status(200).json({ 
      success: true, 
      message: 'Company authentication successful',
      type: 'company'
    });
  } else {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid company password' 
    });
  }
}

// Client project authentication
async function handleClientAuth(projectSlug, password, res) {
  if (!projectSlug || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Project slug and password required' 
    });
  }

  // Get project by slug
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name, client_password')
    .eq('slug', projectSlug)
    .single();

  if (error || !project) {
    return res.status(404).json({ 
      success: false, 
      message: 'Project not found' 
    });
  }

  if (password === project.client_password) {
    return res.status(200).json({ 
      success: true, 
      message: 'Client authentication successful',
      type: 'client',
      project: {
        id: project.id,
        name: project.name,
        slug: projectSlug
      }
    });
  } else {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid project password' 
    });
  }
}

