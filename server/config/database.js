const mongoose = require('mongoose');
const MONGODB_URI = (process.env.MONGODB_URI || '').trim();

// Connection strings to try in order (env first if provided)
const connectionStrings = MONGODB_URI ? [MONGODB_URI] : [
    'mongodb://127.0.0.1:27017/space_biology',
    'mongodb://localhost:27017/space_biology',
    'mongodb://0.0.0.0:27017/space_biology'
];

// Retry interval (ms) can be customized via env var
const RETRY_INTERVAL_MS = parseInt(process.env.DB_RETRY_INTERVAL_MS || '10000', 10);
let retryTimer = null;

const connectOptions = {
    // Use a longer timeout in production or when using a remote cluster (e.g., Atlas)
    serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || (MONGODB_URI ? '10000' : '2000'), 10),
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '5', 10)
};

async function tryConnectOnce() {
    for (const connString of connectionStrings) {
        try {
            console.log(`🔗 Attempting to connect to MongoDB: ${connString}`);
            await mongoose.connect(connString, connectOptions);
            console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
            console.log(`📊 Database: ${mongoose.connection.name}`);
            return true;
        } catch (err) {
            console.log(`❌ Failed to connect to: ${connString}`);
            if (err.message && err.message.includes('ECONNREFUSED')) {
                console.log('💡 MongoDB is not running. Please start MongoDB service.');
            } else {
                console.log(`   ${err.message}`);
            }
            // Try next connection string
        }
    }
    return false;
}

async function attemptConnect() {
    const success = await tryConnectOnce();
    if (!success) {
        if (!retryTimer) {
            console.log(`\n🚨 MongoDB Connection Failed! Will retry every ${Math.round(RETRY_INTERVAL_MS / 1000)}s.`);
            console.log('📝 The app will run without database functionality until connection is established.');
        } else {
            clearTimeout(retryTimer);
        }
        retryTimer = setTimeout(() => {
            retryTimer = null;
            attemptConnect().catch(err => console.error('❌ Retry connect error:', err.message));
        }, RETRY_INTERVAL_MS);
    }
}

// When disconnected later, schedule retry
mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
    if (!retryTimer) {
        retryTimer = setTimeout(() => {
            retryTimer = null;
            attemptConnect().catch(err => console.error('❌ Retry connect error:', err.message));
        }, RETRY_INTERVAL_MS);
    }
});

// Exposed initializer
const connectDB = () => {
    // In production, do not attempt to connect if no MONGODB_URI is provided
    if (process.env.NODE_ENV === 'production' && !MONGODB_URI) {
        console.log('🛑 No MONGODB_URI provided in production. Running without database (offline mode).');
        return;
    }
    attemptConnect().catch(error => {
        console.error('❌ Database connection error:', error.message);
    });
};

module.exports = connectDB;
