const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const verifyToken = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');

router.use(verifyToken);

// GET /api/tenant/profile - Get active business details
router.get('/profile', async (req, res) => {
    try {
        const business = await Business.findById(req.businessId);
        if (!business) return res.status(404).json({ error: 'Business tenant not found' });
        res.json(business);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/tenant/profile - Update company profile & invoice branding
router.put('/profile', requireRole(['owner']), async (req, res) => {
    try {
        const {
            name,
            phone,
            currency,
            taxNumber,
            taxRate,
            logoUrl,
            address,
            invoiceSettings
        } = req.body;

        const business = await Business.findById(req.businessId);
        if (!business) return res.status(404).json({ error: 'Business tenant not found' });

        if (name) business.name = name.trim();
        if (phone !== undefined) business.phone = phone;
        if (currency) business.currency = currency;
        if (taxNumber !== undefined) business.taxNumber = taxNumber;
        if (taxRate !== undefined) business.taxRate = Number(taxRate) || 0;
        if (logoUrl !== undefined) business.logoUrl = logoUrl;
        
        if (address) {
            business.address = {
                ...business.address?.toObject(),
                ...address
            };
        }

        if (invoiceSettings) {
            business.invoiceSettings = {
                ...business.invoiceSettings?.toObject(),
                ...invoiceSettings
            };
        }

        await business.save();
        res.json({ message: 'Business settings updated successfully', business });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
