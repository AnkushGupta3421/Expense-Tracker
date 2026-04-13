import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pool from '../db/database.js'; // This requires DB_NAME, so we might need a separate connection if it doesn't exist.

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  let initialConnection;
  try {
    // 1. Connect without DB to ensure DB exists
    initialConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    const dbName = process.env.DB_NAME || 'expense_tracker';
    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName};`);
    await initialConnection.end();

    console.log(`Database ${dbName} ensured.`);

    // 2. Now use the pool which uses DB_NAME
    const connection = await pool.getConnection();

    // 3. Run schema
    console.log('Running schema...');
    const schemaSql = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
    const statements = schemaSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (let stmt of statements) {
      await connection.query(stmt);
    }

    // 4. Clear existing data
    console.log('Clearing old data...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE expenses;');
    await connection.query('TRUNCATE TABLE users;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    // 5. Seed Users
    console.log('Seeding users...');
    const salt = await bcrypt.genSalt(10);
    const pass1 = await bcrypt.hash('password123', salt);
    
    // insert users
    const [userResult] = await connection.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)',
      [
        'demo', 'demo@example.com', pass1,
        'alice', 'alice@example.com', pass1,
        'bob', 'bob@example.com', pass1
      ]
    );

    const firstUserId = userResult.insertId; // 'demo' ID

    // 6. Seed Expenses for the first user over the last few months
    console.log('Seeding expenses...');
    const categories = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Education', 'Other'];
    
    for (let i = 0; i < 30; i++) {
      const isThisMonth = Math.random() > 0.5;
      const date = new Date();
      if (!isThisMonth) {
        // random month within last 6 months
        date.setMonth(date.getMonth() - Math.floor(Math.random() * 5) - 1);
      }
      date.setDate(Math.floor(Math.random() * 28) + 1);

      const category = categories[Math.floor(Math.random() * categories.length)];
      const amount = (Math.random() * 100 + 10).toFixed(2);
      
      await connection.query(
        'INSERT INTO expenses (user_id, title, amount, category, date, description) VALUES (?, ?, ?, ?, ?, ?)',
        [
          firstUserId,
          `Dummy ${category} Expense ${i}`,
          amount,
          category,
          date.toISOString().split('T')[0],
          `Randomly generated expense for ${category}`
        ]
      );
    }

    console.log('Seed completed successfully!');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
