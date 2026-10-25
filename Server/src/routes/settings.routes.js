const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const verifyToken = require('../middleware/auth.middleware');

// Apply auth middleware
router.use(verifyToken);

// GET Global Settings
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne({ key: 'system' });
        if (!settings) {
            // Create default settings if not exists
            settings = new Settings({ key: 'system' });
            await settings.save();
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// UPDATE Global Settings
router.post('/', async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate(
            { key: 'system' },
            { $set: req.body },
            { new: true, upsert: true }
        );
        res.json({ message: 'Settings updated successfully', settings });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
