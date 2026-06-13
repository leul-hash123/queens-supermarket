const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
// 1. Updated for the cloud environment port
const PORT = process.env.PORT || 3000; 

app.use(express.json());
app.use(cors());

// 2. ADD THIS LINE: Tells your server to show the HTML/CSS website files automatically
app.use(express.static('.')); 

// 3. Initialize Local SQLite Database
const db = new sqlite3.Database('./supermarket.db', (err) => {
    if (err) console.error(err.message);
    console.log('Connected to the database.');
});

// Create a Users Table
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    password TEXT
)`);

// Registration API Endpoint
app.post('/api/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    const sql = `INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)`;
    db.run(sql, [name, email, phone, password], function(err) {
        if (err) {
            return res.status(400).json({ error: "This email is already registered!" });
        }
        res.json({ message: "Account created successfully!" });
    });
});

// Login API Endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db.get(sql, [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            res.json({ message: "Login successful!", user: { name: row.name } });
        } else {
            res.status(400).json({ error: "Wrong email or password." });
        }
    });
});

// 4. Updated server listener for cloud hosting platforms
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running online on port ${PORT}`);
});