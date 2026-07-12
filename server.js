const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const salesRoutes = require('./routes/salesRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins - add your Netlify URL here once deployed
const allowedOrigins = [
    'http://localhost:3000',
    'https://medical-inventory-backend-production-2b53.up.railway.app',
    'https://agent-6a53bd9a38c928a783--storied-tartufo-b3ce2e.netlify.app',
    process.env.FRONTEND_URL, // set this in Railway variables once you have Netlify URL
].filter(Boolean);

// Middleware
app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/sales', salesRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('HealthHub API (MySQL) is running');
});

// Public config endpoint - exposes pharmacy name to frontend
app.get('/api/config', (req, res) => {
    res.json({
        pharmacyName: process.env.PHARMACY_NAME || 'HealthHub',
        version: '1.0.0',
    });
});

// Database Connection & Server Start with retry logic
const connectWithRetry = async (retries = 5, delay = 5000) => {
    for (let i = 1; i <= retries; i++) {
        try {
            await sequelize.authenticate();
            await sequelize.sync();
            console.log('Connected to MySQL Database');
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
            return;
        } catch (err) {
            console.error(`DB connection attempt ${i}/${retries} failed:`, err.message);
            if (i < retries) {
                console.log(`Retrying in ${delay / 1000}s...`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                console.error('All DB connection attempts failed. Exiting.');
                process.exit(1);
            }
        }
    }
};

connectWithRetry();

