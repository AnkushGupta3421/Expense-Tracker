import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a pool instead of a single connection for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'expense_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true // needed for running the schema.sql in one go
});

export const initDb = async () => {
  try {
    // Attempt connecting
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database.');

    // Execute schema if needed
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Ensure the database exists before running statements?
      // Actually we assume the database 'expense_tracker' is created and targeted by the pool.
      // E.g. CREATE DATABASE IF NOT EXISTS expense_tracker;
      
      await connection.query(schemaSql);
      console.log('Schema synchronized.');
    }
    connection.release();
  } catch (error) {
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Database does not exist. Please create the database manually: CREATE DATABASE expense_tracker;');
      process.exit(1);
    }
    console.error('Database initialization failed:', error);
  }
};

export default pool;
