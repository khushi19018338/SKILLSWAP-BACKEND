const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get All Skills (For Browse Page)
router.get('/', async (req, res) => {
  // Can filter by 'offered' or 'wanted' via q parameter
  const { type } = req.query;
  
  let query = supabase.from('skills').select(`
    *,
    users:user_id ( id, first_name, last_name, avatar_url )
  `);

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

// Get Skills for a Specific User
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', userId);
  
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

// Add New Skill
router.post('/', async (req, res) => {
  const { user_id, name, level, type, price_per_hour } = req.body;
  
  const { data, error } = await supabase
    .from('skills')
    .insert([{ user_id, name, level, type, price_per_hour }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// Skill Matching Logic (Basic implementation)
// Returns users offering skills that the current user wants
router.get('/matches/:userId', async (req, res) => {
  const { userId } = req.params;
  
  // 1. Get current user's wanted skills
  const { data: wantedSkills } = await supabase
    .from('skills')
    .select('name')
    .eq('user_id', userId)
    .eq('type', 'wanted');

  if (!wantedSkills || wantedSkills.length === 0) {
    return res.status(200).json({ matches: [] }); // User wants nothing currently
  }

  const wantedSkillNames = wantedSkills.map(s => s.name);

  // 2. Find other users who offer those skills
  const { data: matches, error } = await supabase
    .from('skills')
    .select(`
      id, name, level, price_per_hour,
      users:user_id ( id, first_name, last_name )
    `)
    .eq('type', 'offered')
    .in('name', wantedSkillNames)
    .neq('user_id', userId);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ matches });
});

module.exports = router;
