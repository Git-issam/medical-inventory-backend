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

// Middleware
app.use(express.json());
app.use(cors());

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

// Database Connection & Server Start
sequelize.sync()
    .then(() => {
        console.log('Connected to MySQL Database');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });
