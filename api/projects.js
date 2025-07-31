import { supabase, generateRandomPassword, generateProjectSlug } from '../lib/supabase.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET - Fetch projects or specific project
async function handleGet(req, res) {
  const { id, slug } = req.query;

  if (id || slug) {
    // Get specific project
    const query = id 
      ? supabase.from('projects').select('*').eq('id', id)
      : supabase.from('projects').select('*').eq('slug', slug);
    
    const { data, error } = await query.single();
    
    if (error) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    return res.status(200).json(data);
  } else {
    // Get all projects
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
    
    return res.status(200).json(data);
  }
}

// POST - Create new project
async function handlePost(req, res) {
  const projectData = req.body;
  
  // Generate slug and client password
  const slug = generateProjectSlug(projectData.name);
  const clientPassword = generateRandomPassword();
  
  // Prepare project data
  const newProject = {
    ...projectData,
    slug,
    client_password: clientPassword,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('projects')
    .insert([newProject])
    .select()
    .single();
  
  if (error) {
    return res.status(500).json({ error: 'Failed to create project' });
  }
  
  return res.status(201).json({
    ...data,
    client_url: `/projects/${slug}`,
    client_password: clientPassword
  });
}

// PUT - Update project
async function handlePut(req, res) {
  const { id } = req.query;
  const updateData = {
    ...req.body,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    return res.status(500).json({ error: 'Failed to update project' });
  }
  
  return res.status(200).json(data);
}

// DELETE - Delete project
async function handleDelete(req, res) {
  const { id } = req.query;
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  
  if (error) {
    return res.status(500).json({ error: 'Failed to delete project' });
  }
  
  return res.status(200).json({ message: 'Project deleted successfully' });
}

