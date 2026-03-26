const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Sign Up
router.post('/signup', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) return res.status(400).json({ error: authError.message });

    // Optional: Insert into custom users table
    if (authData.user) {
      const { error: dbError } = await supabase
        .from('users')
        .insert([{ id: authData.user.id, email, first_name: firstName, last_name: lastName }]);
      if (dbError) console.warn("Could not insert user profile:", dbError);
    }

    res.status(201).json({ message: 'User created successfully', user: authData.user });
  } catch (error) {
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Log In
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return res.status(401).json({ error: error.message });

    res.status(200).json({ message: 'Login successful', session: data.session, user: data.user });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Log Out
router.post('/logout', async (req, res) => {
  const { error } = await supabase.auth.signOut();
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
