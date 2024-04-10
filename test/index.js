const { Pool } = require('pg');

// Параметри підключення до бази даних PostgreSQL
const pool = new Pool({
  user: 'your_db_user',
  host: 'your_db_host',
  database: 'your_db_name',
  password: 'your_db_password',
  port: 'your_db_port',
});

module.exports.handler = async (event) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM your_table');
    const rows = result.rows;
    client.release(); // Звільнення підключення

    console.log('Query result:', rows);
    return rows; // Повернення результату запиту
  } catch (err) {
    console.error('Error executing query:', err);
    throw err; // Викидання помилки у випадку невдачі
  }
};
