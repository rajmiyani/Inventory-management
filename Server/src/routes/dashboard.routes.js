const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const verifyToken = require('../middleware/auth.middleware');

// Apply auth middleware
router.use(verifyToken);

// GET Dashboard Stats strictly for active tenant
router.get('/stats', async (req, res) => {
    try {
        const [products, invoices] = await Promise.all([
            Product.find({ businessId: req.businessId }),
            Invoice.find({ businessId: req.businessId })
        ]);

        const totalSales = invoices.reduce((acc, inv) => acc + (inv.total || inv.totalAmount || 0), 0);
        const lowStockItems = products.filter(p => Number(p.stock || 0) <= Number(p.lowStockThreshold || 10)).length;
        const totalProducts = products.length;
        const activeOrders = invoices.length;

        res.json({
            totalSales,
            activeOrders,
            totalProducts,
            lowStockItems
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET Recent Transactions strictly for active tenant
router.get('/recent-transactions', async (req, res) => {
    try {
        const transactions = await Invoice.find({ businessId: req.businessId })
            .sort({ date: -1 })
            .limit(5);

        res.json(transactions);
    } catch (error) {
        console.error('Error fetching recent transactions:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
