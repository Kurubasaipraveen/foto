// Import required modules
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const sqlite3 = require('sqlite3').verbose();
const { json2csv } = require('json-2-csv');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Database setup
const db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database.');
        db.serialize(() => {
            db.run(`CREATE TABLE Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            )`);

            db.run(`CREATE TABLE Books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                quantity INTEGER NOT NULL
            )`);

            db.run(`CREATE TABLE BorrowRequests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                book_id INTEGER NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                status TEXT DEFAULT 'Pending',
                FOREIGN KEY(user_id) REFERENCES Users(id),
                FOREIGN KEY(book_id) REFERENCES Books(id)
            )`);

            db.run(`CREATE TABLE BorrowHistory (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                book_id INTEGER NOT NULL,
                borrowed_on TEXT NOT NULL,
                returned_on TEXT,
                FOREIGN KEY(user_id) REFERENCES Users(id),
                FOREIGN KEY(book_id) REFERENCES Books(id)
            )`);

            console.log('Tables created successfully.');
        });
    }
});

// Helper functions
const hashPassword = async (password) => bcrypt.hash(password, 10);
const generateToken = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

// Middleware for JWT Authentication
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access token missing or invalid.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token is not valid.' });

        req.user = user;
        next();
    });
};

// Routes
// User Registration
app.post('/api/users', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const hashedPassword = await hashPassword(password);
        db.run('INSERT INTO Users (email, password, role) VALUES (?, ?, ?)', [email, hashedPassword, role], function (err) {
            if (err) return res.status(500).json({ error: 'Error creating user.' });

            res.status(201).json({ id: this.lastID, email, role });
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// User Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM Users WHERE email = ?', [email], async (err, user) => {
        if (err || !user) return res.status(401).json({ message: 'Invalid credentials.' });

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(401).json({ message: 'Invalid credentials.' });

        const token = generateToken(user);
        res.json({ token });
    });
});

// Get All Books
app.get('/api/books', authenticateJWT, (req, res) => {
    db.all('SELECT * FROM Books', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error retrieving books.' });

        res.json(rows);
    });
});

// Submit Borrow Request
app.post('/api/borrow-requests', authenticateJWT, (req, res) => {
    const { book_id, start_date, end_date } = req.body;
    const user_id = req.user.id;

    db.run('INSERT INTO BorrowRequests (user_id, book_id, start_date, end_date) VALUES (?, ?, ?, ?)', [user_id, book_id, start_date, end_date], function (err) {
        if (err) return res.status(500).json({ error: 'Error creating borrow request.' });

        res.status(201).json({ id: this.lastID });
    });
});

// Get Borrow History
app.get('/api/users/:id/history', authenticateJWT, (req, res) => {
    const userId = req.params.id;

    db.all('SELECT * FROM BorrowHistory WHERE user_id = ?', [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error retrieving borrow history.' });

        res.json(rows);
    });
});

// Download Borrow History as CSV
app.get('/api/users/:id/history/csv', authenticateJWT, (req, res) => {
    const userId = req.params.id;

    db.all('SELECT * FROM BorrowHistory WHERE user_id = ?', [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error retrieving borrow history.' });

        json2csv(rows, (csvError, csv) => {
            if (csvError) return res.status(500).json({ error: 'Error converting data to CSV.' });

            const fileName = `borrow_history_${userId}.csv`;
            fs.writeFileSync(fileName, csv);
            res.download(fileName, () => fs.unlinkSync(fileName));
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
