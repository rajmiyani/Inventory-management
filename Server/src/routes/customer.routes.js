const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const verifyToken = require('../middleware/auth.middleware');

// Apply auth middleware to all customer routes
router.use(verifyToken);

// GET all customers for this business
router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find({ businessId: req.businessId }).sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE new customer
router.post('/', async (req, res) => {
    try {
        const customer = new Customer({
            ...req.body,
            businessId: req.businessId
        });
        await customer.save();
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE customer
router.put('/:id', async (req, res) => {
    try {
        const customer = await Customer.findOneAndUpdate(
            { _id: req.params.id, businessId: req.businessId },
            req.body,
            { new: true }
        );
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Settle customer due balance (Khata payment settlement)
router.post('/:id/settle-due', async (req, res) => {
    try {
        const { amount } = req.body;
        const customer = await Customer.findOne({ _id: req.params.id, businessId: req.businessId });
        if (!customer) return res.status(404).json({ error: 'Customer not found' });

        const settleAmount = Number(amount) || 0;
        customer.dueBalance = Math.max(0, (customer.dueBalance || 0) - settleAmount);
        await customer.save();

        res.json({ message: 'Due payment recorded', customer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
    try {
        const result = await Customer.findOneAndDelete({ _id: req.params.id, businessId: req.businessId });
        if (!result) return res.status(404).json({ error: 'Customer not found' });
        res.json({ message: 'Customer deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
