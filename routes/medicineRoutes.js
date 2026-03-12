const express = require('express');
const { Op } = require('sequelize');
const Medicine = require('../models/Medicine');
const Sale = require('../models/Sale');
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

// Get Stats for Dashboard (must be before /:id route)
router.get('/stats', async (req, res) => {
    try {
        const totalMedicines = await Medicine.count();

        // Calculate low stock dynamically based on stock value
        const lowStock = await Medicine.count({
            where: {
                stock: { [Op.lte]: 10 },
                expiry: { [Op.gt]: new Date() } // Exclude expired medicines
            }
        });

        // Calculate expired medicines
        const expired = await Medicine.count({
            where: {
                expiry: { [Op.lt]: new Date() }
            }
        });

        // Near expiry - within 30 days
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const nearExpiry = await Medicine.count({
            where: {
                expiry: {
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

// Get medicine by ID
router.get('/:id', async (req, res) => {
    try {
        const medicine = await Medicine.findByPk(req.params.id);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        res.json(medicine);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Dispense medicines (called when generating a bill) - must be before /:id
// Body format: { items: [{ id, quantity, discount }], billDiscount }
//   - discount  : per-item discount percentage (0-100), default 0
//   - billDiscount : overall bill discount percentage applied after item discounts (0-100), default 0
router.post('/dispense', async (req, res) => {
    try {
        // Support both old array format and new { items, billDiscount } format
        let items, billDiscount;
        if (Array.isArray(req.body)) {
            items = req.body;
            billDiscount = 0;
        } else {
            items = req.body.items;
            billDiscount = parseFloat(req.body.billDiscount) || 0;
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Invalid dispense data' });
        }

        // Clamp bill-level discount
        if (billDiscount < 0 || billDiscount > 100) {
            return res.status(400).json({ message: 'billDiscount must be between 0 and 100' });
        }

        // Fetch all medicines first to validate stock
        const ids = items.map(i => i.id);
        const medicines = await Medicine.findAll({ where: { id: ids } });

        // Validate each item has enough stock and valid discount
        for (const item of items) {
            const medicine = medicines.find(m => m.id === parseInt(item.id));
            if (!medicine) {
                return res.status(404).json({ message: `Medicine with id ${item.id} not found` });
            }
            if (medicine.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for "${medicine.name}". Available: ${medicine.stock}, Requested: ${item.quantity}`
                });
            }
            const itemDiscount = parseFloat(item.discount) || 0;
            if (itemDiscount < 0 || itemDiscount > 100) {
                return res.status(400).json({ message: `Discount for "${medicine.name}" must be between 0 and 100` });
            }
        }

        // Deduct stock and build bill line items
        const billItems = [];
        let subtotalBeforeDiscount = 0;
        let totalItemDiscount = 0;

        for (const item of items) {
            const medicine = medicines.find(m => m.id === parseInt(item.id));
            const qty = parseInt(item.quantity);
            const itemDiscount = parseFloat(item.discount) || 0;
            const unitPrice = parseFloat(medicine.price) || 0;

            const lineTotal = unitPrice * qty;
            const lineDiscountAmount = (lineTotal * itemDiscount) / 100;
            const lineNet = lineTotal - lineDiscountAmount;

            subtotalBeforeDiscount += lineTotal;
            totalItemDiscount += lineDiscountAmount;

            billItems.push({
                id: medicine.id,
                name: medicine.name,
                batchNo: medicine.batchNo,
                unitPrice,
                quantity: qty,
                discount: itemDiscount,
                lineTotal: parseFloat(lineTotal.toFixed(2)),
                lineDiscountAmount: parseFloat(lineDiscountAmount.toFixed(2)),
                lineNet: parseFloat(lineNet.toFixed(2)),
            });

            // Deduct stock
            medicine.stock = medicine.stock - qty;
            await medicine.save();
        }

        // Apply overall bill discount on the post-item-discount subtotal
        const afterItemDiscount = subtotalBeforeDiscount - totalItemDiscount;
        const billDiscountAmount = (afterItemDiscount * billDiscount) / 100;
        const grandTotal = afterItemDiscount - billDiscountAmount;

        const bill = {
            items: billItems,
            subtotal: parseFloat(subtotalBeforeDiscount.toFixed(2)),
            itemDiscountTotal: parseFloat(totalItemDiscount.toFixed(2)),
            billDiscount,
            billDiscountAmount: parseFloat(billDiscountAmount.toFixed(2)),
            grandTotal: parseFloat(grandTotal.toFixed(2)),
            generatedAt: new Date().toISOString(),
        };

        // Persist sale record for reporting
        try {
            const billNo = req.body.billNumber || `BILL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const customerName = req.body.customerName || 'Guest';
            const customerContact = req.body.customerContact || '';
            await Sale.create({
                billNumber: billNo,
                customerName,
                customerContact,
                items: billItems,
                subtotal: bill.subtotal,
                itemDiscountTotal: bill.itemDiscountTotal,
                billDiscount: bill.billDiscount,
                billDiscountAmount: bill.billDiscountAmount,
                grandTotal: bill.grandTotal,
                soldAt: new Date(),
            });
        } catch (saleErr) {
            // Non-fatal: log but don't block the bill response
            console.error('Failed to save sale record:', saleErr.message);
        }

        res.json({
            message: 'Medicines dispensed successfully',
            bill
        });
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

module.exports = router;
