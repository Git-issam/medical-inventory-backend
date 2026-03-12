const express = require('express');
const { Op } = require('sequelize');
const Sale = require('../models/Sale');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

/**
 * GET /api/sales/report
 * Query params:
 *   period = 'daily' | 'monthly' | 'yearly'  (default: 'daily')
 *   date   = 'YYYY-MM-DD'  (for daily/monthly anchor, default: today)
 *   year   = 'YYYY'        (for yearly anchor, default: current year)
 */
router.get('/report', async (req, res) => {
    try {
        const { period = 'daily', date, year } = req.query;

        let startDate, endDate;
        const now = new Date();

        if (period === 'daily') {
            const anchor = date ? new Date(date) : now;
            startDate = new Date(anchor);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(anchor);
            endDate.setHours(23, 59, 59, 999);

        } else if (period === 'monthly') {
            const anchor = date ? new Date(date) : now;
            startDate = new Date(anchor.getFullYear(), anchor.getMonth(), 1, 0, 0, 0, 0);
            endDate = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0, 23, 59, 59, 999);

        } else if (period === 'yearly') {
            const y = parseInt(year) || now.getFullYear();
            startDate = new Date(y, 0, 1, 0, 0, 0, 0);
            endDate = new Date(y, 11, 31, 23, 59, 59, 999);

        } else {
            return res.status(400).json({ message: 'Invalid period. Use daily, monthly, or yearly.' });
        }

        const sales = await Sale.findAll({
            where: {
                soldAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['soldAt', 'DESC']]
        });

        // Aggregate stats
        const totalSales = sales.reduce((sum, s) => sum + s.grandTotal, 0);
        const totalDiscount = sales.reduce((sum, s) => sum + s.itemDiscountTotal + s.billDiscountAmount, 0);
        const totalMedicinesSold = sales.reduce((sum, s) => {
            const items = s.items || [];
            return sum + items.reduce((qs, item) => qs + (item.quantity || 0), 0);
        }, 0);

        res.json({
            period,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            totalSales: parseFloat(totalSales.toFixed(2)),
            transactions: sales.length,
            totalMedicinesSold,
            totalDiscount: parseFloat(totalDiscount.toFixed(2)),
            sales: sales.map(s => ({
                id: s.id,
                billNumber: s.billNumber,
                customerName: s.customerName,
                customerContact: s.customerContact,
                items: s.items,
                subtotal: s.subtotal,
                itemDiscountTotal: s.itemDiscountTotal,
                billDiscount: s.billDiscount,
                billDiscountAmount: s.billDiscountAmount,
                grandTotal: s.grandTotal,
                soldAt: s.soldAt,
            }))
        });
    } catch (error) {
        console.error('Sales report error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

/**
 * GET /api/sales/summary
 * Returns a monthly breakdown for the current year (for charts)
 */
router.get('/summary', async (req, res) => {
    try {
        const { year } = req.query;
        const y = parseInt(year) || new Date().getFullYear();
        const startDate = new Date(y, 0, 1, 0, 0, 0, 0);
        const endDate = new Date(y, 11, 31, 23, 59, 59, 999);

        const sales = await Sale.findAll({
            where: { soldAt: { [Op.between]: [startDate, endDate] } },
            order: [['soldAt', 'ASC']]
        });

        // Build monthly buckets
        const months = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            label: new Date(y, i, 1).toLocaleString('en-IN', { month: 'short' }),
            totalSales: 0,
            transactions: 0,
        }));

        for (const s of sales) {
            const m = new Date(s.soldAt).getMonth(); // 0-indexed
            months[m].totalSales += s.grandTotal;
            months[m].transactions += 1;
        }

        months.forEach(m => {
            m.totalSales = parseFloat(m.totalSales.toFixed(2));
        });

        res.json({ year: y, months });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
