const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const verifyToken = require('../middleware/auth.middleware');
const mongoose = require('mongoose');

// Apply auth middleware to all purchase routes
router.use(verifyToken);

// GET all purchases
router.get('/', async (req, res) => {
    try {
        const purchases = await Purchase.find().sort({ date: -1 });
        res.json(purchases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE new purchase order
router.post('/', async (req, res) => {
    try {
        const count = await Purchase.countDocuments();
        const purchaseNo = `PUR-${Date.now()}-${count + 1}`;
        const newPurchase = new Purchase({ ...req.body, purchaseNo });
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

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const purchase = await Purchase.findById(id).session(session);
        if (!purchase) throw new Error('Purchase order not found');

        // Prevent duplicate stock updates
        if (purchase.status === 'Received' && status === 'Received') {
            return res.json({ message: 'Already received' });
        }

        // If marking as received, increment stock
        if (status === 'Received' && purchase.status !== 'Received') {
            for (const item of purchase.items) {
                await Product.findOneAndUpdate(
                    { name: item.name },
                    { $inc: { stock: item.quantity } },
                    { session }
                );
            }
        }

        purchase.status = status;
        await purchase.save({ session });
        await session.commitTransaction();
        res.json({ id, status, message: 'Status updated successfully' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ error: error.message });
    } finally {
        session.endSession();
    }
});

module.exports = router;

module.exports = router;
