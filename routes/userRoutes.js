const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Get Profile
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, bio, wallet_balance, accept_payments')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ error: 'User not found' });
  res.status(200).json(data);
});

// Update Profile
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, bio, accept_payments } = req.body;

  const { data, error } = await supabase
    .from('users')
    .update({ first_name, last_name, bio, accept_payments })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json(data);
});

module.exports = router;
