const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const verifyToken = require('../middleware/auth.middleware');

// Apply auth middleware
router.use(verifyToken);

// GET Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        const [productsSnapshot, invoicesSnapshot] = await Promise.all([
            db.collection('products').get(),
            db.collection('invoices').get()
        ]);

        const products = productsSnapshot.docs.map(doc => doc.data());
        const invoices = invoicesSnapshot.docs.map(doc => doc.data());

        const totalSales = invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
        const lowStockItems = products.filter(p => Number(p.stock || 0) <= Number(p.lowStockThreshold || 0)).length;
        const totalProducts = products.length;
        const activeOrders = invoices.length; // Assuming all invoices as active orders for simplicity

        res.json({
            totalSales,
            activeOrders,
            totalProducts,
            lowStockItems
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET Recent Transactions
router.get('/recent-transactions', async (req, res) => {
    try {
        const snapshot = await db.collection('invoices')
            .orderBy('date', 'desc')
            .limit(5)
            .get();

        const transactions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(transactions);
    } catch (error) {
        console.error('Error fetching recent transactions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
