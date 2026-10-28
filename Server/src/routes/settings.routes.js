const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const Business = require('../models/Business');
const verifyToken = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');

// Apply auth middleware
router.use(verifyToken);

// GET Tenant Settings
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne({ businessId: req.businessId });
        if (!settings) {
            const business = await Business.findById(req.businessId);
            settings = new Settings({ 
                businessId: req.businessId,
                storeName: business?.name || 'SmartInv Store',
                currency: business?.currency || 'INR',
                taxRate: business?.taxRate || 0
            });
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE Tenant Settings
router.post('/', requireRole(['owner', 'manager']), async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { businessId: req.businessId },
            { $set: { ...req.body, businessId: req.businessId } },
            { new: true, upsert: true }
        );

        // Also update Business name/currency if provided
        if (req.body.storeName || req.body.currency || req.body.taxRate !== undefined) {
            await Business.findByIdAndUpdate(req.businessId, {
                ...(req.body.storeName && { name: req.body.storeName }),
                ...(req.body.currency && { currency: req.body.currency }),
                ...(req.body.taxRate !== undefined && { taxRate: req.body.taxRate })
            });
        }

        res.json({ message: 'Settings updated successfully', settings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
