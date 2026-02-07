    const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('Medical Inventory API (MySQL) is running');
});

// Database Connection & Server Start
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Connected to MySQL Database');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });
