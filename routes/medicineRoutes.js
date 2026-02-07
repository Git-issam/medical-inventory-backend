const express = require('express');
const { Op } = require('sequelize');
const Medicine = require('../models/Medicine');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all medicines
router.get('/', async (req, res) => {
    try {
        const medicines = await Medicine.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Add new medicine
router.post('/', async (req, res) => {
    try {
        const newMedicine = await Medicine.create(req.body);
        res.status(201).json(newMedicine);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Update medicine
router.put('/:id', async (req, res) => {
    try {
        const [updated] = await Medicine.update(req.body, {
            where: { id: req.params.id }
        });

        if (updated) {
            const updatedMedicine = await Medicine.findByPk(req.params.id);
            return res.json(updatedMedicine);
        }
        return res.status(404).json({ message: 'Medicine not found' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Delete medicine
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Medicine.destroy({
            where: { id: req.params.id }
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        res.json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Get Stats for Dashboard
router.get('/stats', async (req, res) => {
    try {
        const totalMedicines = await Medicine.count();
        const lowStock = await Medicine.count({ where: { status: 'Low Stock' } });
        const expired = await Medicine.count({ where: { status: 'Expired' } });

        // Near expiry - within 30 days
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const nearExpiry = await Medicine.count({
            where: {
                expiryDate: {
                    [Op.gt]: today,
                    [Op.lte]: thirtyDaysFromNow
                }
            }
        });

        res.json({
            totalMedicines,
            lowStock,
            expired,
            nearExpiry
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
