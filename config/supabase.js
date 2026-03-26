require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Warning: Missing SUPABASE_URL or SUPABASE_ANON_KEY in backend environment variables.");
}

// Initialize the Supabase Client
const supabase = createClient(
  supabaseUrl || 'https://oifzkwlpxmrxoamfobkw.supabase.co', // Dummy fallback to prevent crashes
  supabaseKey || 'dummy-key-to-prevent-crash'
);

module.exports = supabase;
