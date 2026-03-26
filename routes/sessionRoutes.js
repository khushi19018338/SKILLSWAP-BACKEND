const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get Sessions for User (Both as Learner and Author)
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      skills:skill_id ( name, level, price_per_hour, type ),
      learner:learner_id ( first_name, last_name, avatar_url ),
      author:author_id ( first_name, last_name, avatar_url )
    `)
    .or(`learner_id.eq.${userId},author_id.eq.${userId}`)
    .order('scheduled_for', { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

// Book a Session
router.post('/book', async (req, res) => {
  const { learner_id, author_id, skill_id, scheduled_for, is_paid, amount } = req.body;
  
  const { data, error } = await supabase
    .from('sessions')
    .insert([{
      learner_id, author_id, skill_id, scheduled_for, 
      is_paid, amount, status: 'pending', escrow_status: is_paid ? 'held' : 'none'
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ message: 'Session booked successfully', session: data });
});

// Update Session Status (Accept, Complete)
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, updater_id } = req.body; 
  // updater_id should be validated in a real app to ensure only authorized parties can complete or accept

  const updates = { status };
  
  // Custom logic for releasing money upon completion
  if (status === 'completed') {
    updates.escrow_status = 'released';
    // Logic to increment wallet balance of the author would be handled here
    // Example: RPC call or direct update to users table
  }

  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

module.exports = router;
