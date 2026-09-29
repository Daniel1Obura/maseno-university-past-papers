const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sci_past_papers',
  password: 'd0430',
  port: 5432,
});

module.exports = pool;