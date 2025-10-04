const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const adminRoutes = require('./routes/admin');
const articleFetchRouter = require('./routes/article-fetch');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Session middleware
app.use(session({
    secret: 'space-biology-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Import routes
const authRoutes = require('./routes/auth');
const experimentRoutes = require('./routes/experiments');
const contactRoutes = require('./routes/contact');
const articlesRoutes = require('./routes/articles');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/articles', articlesRoutes);
app.use(articleFetchRouter);

// API test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Space Biology Dashboard API is working!', 
        timestamp: new Date().toISOString(),
        status: 'OK',
        database: (mongoose.connection && mongoose.connection.readyState === 1) ? 'Connected' : 'Disconnected',
        version: '1.0.0'
    });
});

// Admin dashboard route
app.get('/admin', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/dashboard');
    }
    res.sendFile(path.join(__dirname, '../views/admin.html'));
});

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/dashboard.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/contact.html'));
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Function to find available port
const findAvailablePort = (startPort, maxAttempts = 10) => {
    return new Promise((resolve, reject) => {
        const net = require('net');
        let port = startPort;
        let attempts = 0;

        const tryPort = (testPort) => {
            const server = net.createServer();
            
            server.listen(testPort, () => {
                server.close(() => {
                    resolve(testPort);
                });
            });
            
            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        reject(new Error(`No available ports found after ${maxAttempts} attempts`));
                    } else {
                        tryPort(testPort + 1);
                    }
                } else {
                    reject(err);
                }
            });
        };

        tryPort(port);
    });
};

// Get local IP address
const getLocalIP = () => {
    const interfaces = require('os').networkInterfaces();
    for (let name of Object.keys(interfaces)) {
        for (let interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return 'localhost';
};

// Start server with port detection
const startServer = async () => {
    try {
        const PORT = process.env.PORT || 3000;
        const availablePort = await findAvailablePort(PORT, 10);
        
        app.listen(availablePort, () => {
            console.log('🚀 Space Biology Dashboard Server Started!');
            console.log('══════════════════════════════════════════');
            console.log(`📍 Local: http://localhost:${availablePort}`);
            console.log(`📍 Network: http://${getLocalIP()}:${availablePort}`);
            console.log('══════════════════════════════════════════');
            console.log(`📊 Dashboard: http://localhost:${availablePort}/dashboard`);
            console.log(`ℹ️  API Test: http://localhost:${availablePort}/api/test`); // FIXED: Removed extra slash
            console.log('🔧 Ready for development!');
            console.log('\n💡 Next steps:');
            console.log(`1. Visit http://localhost:${availablePort} to see the login page`);
            console.log('2. Register a new user account');
            console.log('3. Explore the dashboard');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Server shutting down...');
    process.exit(0);
});

// Start the server
startServer();