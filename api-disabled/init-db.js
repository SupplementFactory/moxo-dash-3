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
    // Create projects table
    const { error: projectsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS projects (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          status TEXT DEFAULT 'In Progress',
          automation_status TEXT DEFAULT 'Running',
          current_stage INTEGER DEFAULT 1,
          brief_approval_date DATE,
          progress INTEGER DEFAULT 0,
          time_efficiency INTEGER DEFAULT 100,
          tests_completed INTEGER DEFAULT 0,
          total_tests INTEGER DEFAULT 19,
          quality_score DECIMAL(5,2) DEFAULT 0.0,
          budget_used DECIMAL(10,2) DEFAULT 0.0,
          budget_total DECIMAL(10,2) DEFAULT 0.0,
          project_manager TEXT,
          created_date DATE DEFAULT CURRENT_DATE,
          last_updated DATE DEFAULT CURRENT_DATE,
          delay_notes TEXT,
          slug TEXT UNIQUE NOT NULL,
          client_password TEXT NOT NULL,
          key_ingredients TEXT,
          target_specs TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (projectsError) {
      console.error('Error creating projects table:', projectsError);
    }

    // Insert sample data if table is empty
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    if (!existingProjects || existingProjects.length === 0) {
      const sampleProjects = [
        {
          name: 'Heal - Greens Blend',
          description: 'Premium organic greens blend featuring spirulina, chlorella, wheatgrass, and barley grass. Formulated for maximum bioavailability and nutrient density with natural flavor enhancement.',
          status: 'In Progress',
          automation_status: 'Running',
          current_stage: 2,
          progress: 10,
          time_efficiency: 100,
          tests_completed: 2,
          total_tests: 19,
          quality_score: 85.0,
          budget_used: 1250.00,
          budget_total: 15000.00,
          project_manager: 'Dr. Sarah Chen, PhD - Senior Formulation Scientist',
          created_date: '2025-07-15',
          last_updated: '2025-07-24',
          delay_notes: 'Project initiated. Awaiting client approval of formulation brief to begin development timeline.',
          slug: 'heal-greens-blend',
          client_password: 'HealGreens2024',
          key_ingredients: 'Organic Spirulina (2000mg), Chlorella (1500mg), Wheatgrass (1000mg), Barley Grass (1000mg), Moringa Leaf (500mg), Natural Mint Flavor, Stevia Extract',
          target_specs: '30-serving container, 8g serving size, pH 6.5-7.5, moisture content <5%, particle size 80-120 mesh, green color index 85-95, 24-month shelf life'
        },
        {
          name: 'Immune Support Complex',
          description: 'Advanced immune system support formula combining vitamin C, zinc, elderberry, and echinacea with proprietary absorption enhancers.',
          status: 'In Progress',
          automation_status: 'Running',
          current_stage: 8,
          brief_approval_date: '2025-07-10',
          progress: 42,
          time_efficiency: 95,
          tests_completed: 8,
          total_tests: 19,
          quality_score: 92.5,
          budget_used: 6800.00,
          budget_total: 18000.00,
          project_manager: 'Dr. Michael Rodriguez, PhD - Lead Research Scientist',
          created_date: '2025-06-28',
          last_updated: '2025-07-24',
          delay_notes: 'On schedule. Currently in stability testing phase.',
          slug: 'immune-support-complex',
          client_password: 'Immune2024',
          key_ingredients: 'Vitamin C (1000mg), Zinc Gluconate (15mg), Elderberry Extract (500mg), Echinacea (400mg), Quercetin (250mg)',
          target_specs: '60-capsule bottle, 2-capsule serving size, enteric coating, 36-month shelf life'
        }
      ];

      const { error: insertError } = await supabase
        .from('projects')
        .insert(sampleProjects);

      if (insertError) {
        console.error('Error inserting sample data:', insertError);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Database initialized successfully' 
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to initialize database' 
    });
  }
}

