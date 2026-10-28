const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const { checkStaffLimit } = require('../middleware/subscriptionCheck.middleware');

router.use(verifyToken);

// GET /api/staff - List all staff for this business
router.get('/', requireRole(['owner', 'manager']), async (req, res) => {
    try {
        const staff = await User.find({ businessId: req.businessId })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/staff - Add a new staff member (Cashier / Manager)
router.post('/', requireRole(['owner', 'manager']), checkStaffLimit, async (req, res) => {
    try {
        const { name, email, password, role = 'cashier', phone = '' } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        if (!['manager', 'cashier'].includes(role)) {
            return res.status(400).json({ error: 'Role must be either manager or cashier' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ error: 'A user with this email already exists' });
        }

        const newStaff = new User({
            name: name.trim(),
            email: normalizedEmail,
            password,
            role,
            phone,
            businessId: req.businessId,
            status: 'active'
        });

        await newStaff.save();

        res.status(201).json({
            id: newStaff._id,
            name: newStaff.name,
            email: newStaff.email,
            role: newStaff.role,
            status: newStaff.status,
            createdAt: newStaff.createdAt
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/staff/:id/status - Toggle staff active / suspended
router.put('/:id/status', requireRole(['owner']), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({ error: 'Status must be active or suspended' });
        }

        const staff = await User.findOne({ _id: req.params.id, businessId: req.businessId });
        if (!staff) return res.status(404).json({ error: 'Staff member not found' });

        if (staff.role === 'owner') {
            return res.status(400).json({ error: 'Cannot change status of store owner' });
        }

        staff.status = status;
        await staff.save();

        res.json({ message: `Staff status updated to ${status}`, staff });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/staff/:id - Remove a staff member
router.delete('/:id', requireRole(['owner']), async (req, res) => {
    try {
        const staff = await User.findOne({ _id: req.params.id, businessId: req.businessId });
        if (!staff) return res.status(404).json({ error: 'Staff member not found' });

        if (staff.role === 'owner') {
            return res.status(400).json({ error: 'Cannot delete business owner account' });
        }

        await User.deleteOne({ _id: req.params.id, businessId: req.businessId });
        res.json({ message: 'Staff member removed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
