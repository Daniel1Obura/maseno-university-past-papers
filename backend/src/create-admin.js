require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../db');

const [, , username, password] = process.argv;

if (!username || !password) {
  console.error('Usage: node src/create-admin.js <username> <password>');
  process.exit(1);
}

async function createAdmin() {
  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO admins (username, password_hash) VALUES ($1, $2)',
      [username, passwordHash]
    );

    console.log(`Admin "${username}" created successfully.`);
  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();