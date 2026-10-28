const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Purchase = require('../models/Purchase');
const verifyToken = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');

// Apply auth middleware & restrict financial accounting from cashiers
router.use(verifyToken);
router.use(requireRole(['owner', 'manager']));

// GET Accounting Stats strictly for active tenant
router.get('/stats', async (req, res) => {
    try {
        const { range } = req.query;
        let dateFilter = { businessId: req.businessId };

        if (range && range !== 'all') {
            const now = new Date();
            let startDate = new Date();

            switch (range) {
                case '7d':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case '15d':
                    startDate.setDate(now.getDate() - 15);
                    break;
                case '1m':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case '3m':
                    startDate.setMonth(now.getMonth() - 3);
                    break;
                case '6m':
                    startDate.setMonth(now.getMonth() - 6);
                    break;
                case '1y':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
                default:
                    startDate = null;
            }

            if (startDate) {
                dateFilter.date = { $gte: startDate };
            }
        }

        const [invoices, purchases] = await Promise.all([
            Invoice.find(dateFilter),
            Purchase.find({ ...dateFilter, status: { $ne: 'Cancelled' } })
        ]);

        const totalIncome = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
        const totalExpenses = purchases.reduce((acc, pur) => acc + (pur.total || 0), 0);
        const netProfit = totalIncome - totalExpenses;

        const incomeTxns = invoices.map(inv => ({
            id: inv._id,
            date: inv.date,
            description: `Invoice ${inv.invoiceNo}`,
            type: 'Income',
            category: 'Sales',
            amount: inv.total,
            status: 'Cleared'
        }));

        const expenseTxns = purchases.map(pur => ({
            id: pur._id,
            date: pur.date,
            description: `Purchase from ${pur.supplier}`,
            type: 'Expense',
            category: 'Inventory',
            amount: pur.total,
            status: pur.status === 'Received' ? 'Cleared' : 'Pending'
        }));

        const allTransactions = [...incomeTxns, ...expenseTxns]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 25);

        res.json({
            totalIncome,
            totalExpenses,
            netProfit,
            transactions: allTransactions
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to aggregate accounting data' });
    }
});

module.exports = router;
