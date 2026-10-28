const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const verifyToken = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { checkProductLimit } = require('../middleware/subscriptionCheck.middleware');

// Apply auth middleware to all inventory routes
router.use(verifyToken);

// GET all products for active tenant
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ businessId: req.businessId }).sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET inventory insights strictly for active tenant
router.get('/insights', async (req, res) => {
    try {
        const products = await Product.find({ businessId: req.businessId });

        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);

        // Fetch invoices for this business only
        const invoices = await Invoice.find({
            businessId: req.businessId,
            date: { $gte: ninetyDaysAgo }
        });

        const salesData = {};

        invoices.forEach(inv => {
            inv.items.forEach(item => {
                if (!item.productId) return;
                const prodId = item.productId.toString();
                if (!salesData[prodId]) {
                    salesData[prodId] = { lastSale: inv.date, totalQty: 0, recentQty: 0 };
                }
                salesData[prodId].totalQty += (Number(item.quantity) || 0);
                if (inv.date >= thirtyDaysAgo) {
                    salesData[prodId].recentQty += (Number(item.quantity) || 0);
                }
                if (inv.date > salesData[prodId].lastSale) {
                    salesData[prodId].lastSale = inv.date;
                }
            });
        });

        const insights = {
            lowStock: [],
            expiringSoon: [],
            fastMoving: [],
            deadStock: [],
            bestSellers: [],
            worstSellers: [],
            stats: {
                totalProducts: products.length,
                lowStockCount: 0,
                expiringCount: 0
            }
        };

        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        const allProductsWithSales = products.map(p => {
            const sold = salesData[p._id.toString()] || { totalQty: 0, recentQty: 0, lastSale: null };
            const pObj = p.toObject();

            // 1. Low Stock
            if (p.stock <= p.lowStockThreshold) {
                insights.lowStock.push(p);
                insights.stats.lowStockCount++;
            }

            // 2. Expiring Soon
            if (p.expiryDate) {
                if (p.expiryDate <= thirtyDaysFromNow && p.expiryDate >= now) {
                    insights.expiringSoon.push({
                        ...pObj,
                        expiryDays: Math.ceil((p.expiryDate - now) / (1000 * 60 * 60 * 24))
                    });
                    insights.stats.expiringCount++;
                } else if (p.expiryDate < now) {
                    insights.expiringSoon.push({ ...pObj, expired: true });
                }
            }

            // 3. Fast Moving (Historical)
            if (sold.recentQty >= 5) {
                insights.fastMoving.push({ ...pObj, monthlySales: sold.recentQty });
            }

            // 4. Dead Stock
            if (p.stock > 0 && (!sold.lastSale || sold.lastSale < ninetyDaysAgo)) {
                insights.deadStock.push({ ...pObj, daysSinceLastSale: sold.lastSale ? Math.ceil((now - sold.lastSale) / (1000 * 60 * 60 * 24)) : 'Never' });
            }

            return { ...pObj, totalSales: sold.totalQty, recentSales: sold.recentQty };
        });

        // 5. Best Sellers (Top 5 by total sales)
        insights.bestSellers = [...allProductsWithSales]
            .filter(p => p.totalSales > 0)
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, 5);

        // 6. Worst Sellers (Bottom 5 by total sales, having stock)
        insights.worstSellers = [...allProductsWithSales]
            .filter(p => p.stock > 0)
            .sort((a, b) => a.totalSales - b.totalSales)
            .slice(0, 5);

        res.json(insights);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ _id: req.params.id, businessId: req.businessId });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE new product (Scoped to businessId + subscription limit check)
router.post('/', requireRole(['owner', 'manager']), checkProductLimit, async (req, res) => {
    try {
        const { sku } = req.body;
        // Verify unique SKU within this business
        const existingSku = await Product.findOne({ businessId: req.businessId, sku });
        if (existingSku) {
            return res.status(400).json({ error: `SKU / Barcode '${sku}' is already in use in your store` });
        }

        const product = new Product({
            ...req.body,
            businessId: req.businessId
        });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE product
router.put('/:id', requireRole(['owner', 'manager']), async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, businessId: req.businessId },
            req.body,
            { new: true }
        );
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE product
router.delete('/:id', requireRole(['owner', 'manager']), async (req, res) => {
    try {
        const result = await Product.findOneAndDelete({ _id: req.params.id, businessId: req.businessId });
        if (!result) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
