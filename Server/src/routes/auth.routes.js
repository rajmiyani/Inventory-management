const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Business = require('../models/Business');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth.middleware');

// Helper function to seed initial demo products for new business
const seedInitialProducts = async (businessId, category) => {
    const defaultTemplates = {
        retail: [
            { name: 'Wireless Bluetooth Mouse', sku: 'WBM-001', category: 'Electronics', price: 799, purchasePrice: 450, stock: 45, unit: 'pcs' },
            { name: 'Mechanical Keyboard RGB', sku: 'MKR-002', category: 'Electronics', price: 2499, purchasePrice: 1500, stock: 20, unit: 'pcs' },
            { name: 'Fast USB-C Charging Cable (1m)', sku: 'UCC-003', category: 'Accessories', price: 299, purchasePrice: 120, stock: 100, unit: 'pcs' },
            { name: 'Laptop Stand Aluminum Foldable', sku: 'LSA-004', category: 'Office', price: 1299, purchasePrice: 700, stock: 35, unit: 'pcs' }
        ],
        pharmacy: [
            { name: 'Paracetamol 650mg Tablets', sku: 'PCM-650', category: 'Medicines', price: 35, purchasePrice: 20, stock: 150, unit: 'strips' },
            { name: 'Vitamin C Chewable 500mg', sku: 'VTC-500', category: 'Supplements', price: 120, purchasePrice: 70, stock: 80, unit: 'bottles' },
            { name: 'Digital Infrared Thermometer', sku: 'DIT-001', category: 'Devices', price: 1450, purchasePrice: 850, stock: 15, unit: 'pcs' }
        ],
        supermarket: [
            { name: 'Basmati Rice Premium (5kg)', sku: 'BRP-005', category: 'Grains', price: 480, purchasePrice: 380, stock: 50, unit: 'bags' },
            { name: 'Organic Cold-Pressed Olive Oil (1L)', sku: 'OCO-001', category: 'Cooking Oils', price: 850, purchasePrice: 620, stock: 25, unit: 'bottles' },
            { name: 'Roasted Almonds (250g)', sku: 'RMA-250', category: 'Dry Fruits', price: 320, purchasePrice: 240, stock: 60, unit: 'packs' }
        ]
    };

    const items = defaultTemplates[category] || defaultTemplates.retail;
    try {
        await Product.insertMany(items.map(item => ({ ...item, businessId })));
    } catch (e) {
        console.error('Initial product seed error (non-fatal):', e.message);
    }
};

// POST /api/auth/register-business (Multi-Tenant Owner Onboarding Wizard)
router.post('/register-business', async (req, res) => {
    try {
        const { 
            businessName, 
            category = 'retail', 
            currency = 'INR', 
            phone = '',
            name, 
            email, 
            password 
        } = req.body;

        if (!businessName || !name || !email || !password) {
            return res.status(400).json({ error: 'Business Name, Owner Name, Email, and Password are required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ error: 'An account with this email already exists' });
        }

        // Generate clean unique URL slug
        let baseSlug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'store';
        let slug = baseSlug;
        let counter = 1;
        while (await Business.findOne({ slug })) {
            slug = `${baseSlug}-${counter++}`;
        }

        // 1. Create Business Tenant
        const newBusiness = new Business({
            name: businessName.trim(),
            slug,
            ownerId: null, // set right after creating user
            email: normalizedEmail,
            phone,
            category,
            currency,
            subscription: {
                plan: 'trial',
                status: 'trialing',
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 Days
                validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            },
            limits: {
                maxProducts: 50,
                maxStaff: 2,
                maxInvoicesPerMonth: 200
            }
        });

        // 2. Create Owner User
        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            password,
            businessId: newBusiness._id,
            role: 'owner',
            phone
        });

        await newUser.save();

        newBusiness.ownerId = newUser._id;
        await newBusiness.save();

        // 3. Seed demo products for instant usability
        await seedInitialProducts(newBusiness._id, category);

        // 4. Issue JWT Token
        const token = jwt.sign(
            { id: newUser._id, businessId: newBusiness._id, role: 'owner' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                businessId: newBusiness._id
            },
            business: {
                id: newBusiness._id,
                name: newBusiness.name,
                slug: newBusiness.slug,
                category: newBusiness.category,
                currency: newBusiness.currency,
                subscription: newBusiness.subscription,
                limits: newBusiness.limits,
                invoiceSettings: newBusiness.invoiceSettings
            }
        });
    } catch (error) {
        console.error('Register business error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/register (Standard Register)
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, businessName } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Auto-create business if registered via legacy form
        const slug = `store-${Date.now().toString().slice(-6)}`;
        const business = new Business({
            name: businessName || `${name}'s Store`,
            slug,
            email: normalizedEmail,
            currency: 'INR'
        });

        const user = new User({
            email: normalizedEmail,
            password,
            name,
            businessId: business._id,
            role: 'owner'
        });

        await user.save();
        business.ownerId = user._id;
        await business.save();

        const token = jwt.sign(
            { id: user._id, businessId: business._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: { id: user._id, email: user.email, name: user.name, role: user.role, businessId: business._id },
            business
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({ error: 'Your account has been suspended. Please contact your store administrator.' });
        }

        // Find or auto-link Business
        let business = null;
        if (user.businessId) {
            business = await Business.findById(user.businessId);
        }

        if (!business) {
            // Check if user is owner of an unlinked business
            business = await Business.findOne({ ownerId: user._id });
            if (!business) {
                // Auto create default business
                const slug = `store-${user._id.toString().slice(-6)}`;
                business = new Business({
                    name: `${user.name}'s Store`,
                    slug,
                    ownerId: user._id,
                    email: user.email,
                    currency: 'INR'
                });
                await business.save();
            }
            user.businessId = business._id;
            user.role = 'owner';
            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, businessId: business._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                businessId: business._id
            },
            business: {
                id: business._id,
                name: business.name,
                slug: business.slug,
                category: business.category,
                currency: business.currency,
                subscription: business.subscription,
                limits: business.limits,
                invoiceSettings: business.invoiceSettings,
                logoUrl: business.logoUrl,
                taxNumber: business.taxNumber,
                taxRate: business.taxRate,
                address: business.address
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/auth/profile
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });

        let business = null;
        if (req.businessId) {
            business = await Business.findById(req.businessId);
        }

        res.json({ user, business });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/auth/profile
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { name, phone, bio } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (bio !== undefined) user.bio = bio;

        await user.save();
        res.json({ id: user._id, email: user.email, name: user.name, role: user.role, phone: user.phone, bio: user.bio });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
