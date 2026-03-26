const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Create Review
router.post('/', async (req, res) => {
  const { session_id, reviewer_id, reviewee_id, rating, comment } = req.body;

  const { data, error } = await supabase
    .from('reviews')
    .insert([{ session_id, reviewer_id, reviewee_id, rating, comment }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// Get Reviews for a User
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from('reviews')
    .select('rating, comment, created_at, reviewer:reviewer_id(first_name, last_name)')
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  
  // Calculate average rating client-side or server-side mapping 
  const avgRating = data.length > 0 ? (data.reduce((acc, curr) => acc + curr.rating, 0) / data.length).toFixed(1) : 0;

  res.status(200).json({ reviews: data, average_rating: avgRating, total_reviews: data.length });
});

module.exports = router;
