const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Hardcoded admin credentials (in production, use environment variables)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    email: 'admin@nasa.gov',
    password: 'admin123' // In real app, hash this
};

// Temporary in-memory storage for regular users
let users = [];

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user exists
        const existingUser = users.find(u => u.email === email || u.username === username);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create user
        const user = {
            id: users.length + 1,
            username,
            email,
            password: password,
            role: 'user',
            createdAt: new Date()
        };

        users.push(user);

        // Set session
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.json({ success: true, user: req.session.user });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if admin
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            req.session.user = {
                id: 'admin',
                username: ADMIN_CREDENTIALS.username,
                email: ADMIN_CREDENTIALS.email,
                role: 'admin'
            };
            return res.json({ success: true, user: req.session.user, isAdmin: true });
        }
        
        // Check regular users
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        res.json({ success: true, user: req.session.user, isAdmin: false });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Check session
router.get('/check', (req, res) => {
    if (req.session.user) {
        res.json({ 
            loggedIn: true, 
            user: req.session.user,
            isAdmin: req.session.user.role === 'admin'
        });
    } else {
        res.json({ loggedIn: false });
    }
});

module.exports = router;