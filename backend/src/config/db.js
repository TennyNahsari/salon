const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'salon',
  password: process.env.DB_PASSWORD || 'salon',
  database: process.env.DB_NAME || 'salon',
});

const initDatabase = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL Database successfully.');
    
    const schemaPath = path.join(__dirname, '../schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(sql);
      console.log('Database tables & seed data initialized successfully.');
    }
    client.release();
  } catch (err) {
    console.error('Error connecting to database or initializing schema:', err.message);
    console.warn('Note: Make sure PostgreSQL is running on localhost:5432 and database "salon" exists with user "salon" and password "salon".');
  }
};

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  initDatabase
};
