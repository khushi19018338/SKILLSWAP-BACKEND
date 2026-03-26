const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("No DATABASE_URL found.");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false } // Supabase requires SSL
});

async function runMigration() {
  console.log("Connecting to Supabase Database...");
  try {
    await client.connect();
    console.log("Connected successfully. Executing schema.sql...");
    
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const sqlQuery = fs.readFileSync(schemaPath, 'utf8');
    
    await client.query(sqlQuery);
    console.log("✅ All SQL tables (users, skills, sessions, messages, reviews) successfully created/updated in Supabase!");
    
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  } finally {
    await client.end();
  }
}

runMigration();
