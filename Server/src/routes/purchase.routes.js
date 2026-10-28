const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const verifyToken = require('../middleware/auth.middleware');
const mongoose = require('mongoose');

// Apply auth middleware to all purchase routes
router.use(verifyToken);

// GET all purchases for this business
router.get('/', async (req, res) => {
    try {
        const purchases = await Purchase.find({ businessId: req.businessId }).sort({ date: -1 });
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE new purchase order
router.post('/', async (req, res) => {
    try {
        const count = await Purchase.countDocuments({ businessId: req.businessId });
        const purchaseNo = `PUR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
        const newPurchase = new Purchase({ 
            ...req.body, 
            businessId: req.businessId,
            purchaseNo 
        });
        await newPurchase.save();
        res.status(201).json(newPurchase);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE purchase status
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: 'Status is required' });

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();
    } catch (e) {
        session = null;
    }

    try {
        const purchase = await Purchase.findOne({ _id: id, businessId: req.businessId }).session(session);
        if (!purchase) throw new Error('Purchase order not found');

        // Prevent duplicate stock updates
        if (purchase.status === 'Received' && status === 'Received') {
            return res.json({ message: 'Already received' });
        }

        // If marking as received, increment stock scoped to this business
        if (status === 'Received' && purchase.status !== 'Received') {
            for (const item of purchase.items) {
                const query = item.productId 
                    ? { _id: item.productId, businessId: req.businessId }
                    : { name: item.name, businessId: req.businessId };

                await Product.findOneAndUpdate(
                    query,
                    { $inc: { stock: item.quantity } },
                    { session }
                );
            }
        }

        purchase.status = status;
        await purchase.save({ session });

        if (session) {
            await session.commitTransaction();
        }
        res.json({ id, status, message: 'Status updated successfully' });
    } catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        res.status(500).json({ error: error.message });
    } finally {
        if (session) {
            session.endSession();
        }
    }
});

module.exports = router;
