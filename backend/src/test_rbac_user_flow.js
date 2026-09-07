const db = require('./config/db');

async function testRBAC() {
  try {
    console.log('Testing User & RBAC backend...');

    // 1. Ensure table column outlet_id exists
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS outlet_id INT REFERENCES outlets(id) ON DELETE SET NULL;');

    // 2. Fetch users
    const users = await db.query(`
      SELECT u.id, u.username, u.name, u.role, u.outlet_id, o.name as outlet_name
      FROM users u
      LEFT JOIN outlets o ON u.outlet_id = o.id
    `);
    console.log('Existing users in database:', users.rows);

    console.log('RBAC Database structure verified successfully.');
    process.exit(0);
  } catch (err) {
    console.error('RBAC test error:', err);
    process.exit(1);
  }
}

testRBAC();
