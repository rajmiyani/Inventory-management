const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const Product = require('../models/Product');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const verifyToken = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/rbac.middleware');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET_HERE'
});

// Plan definitions & limits as specified by user
const PLAN_LIMITS = {
    trial: {
        name: 'Trial',
        title: '14-Day Free Trial',
        price: 0,
        maxProducts: 50,
        maxStaff: 2,
        maxInvoicesPerMonth: 200,
        features: {
            thermalPrint: true,
            barcodeGenerator: true,
            advancedAccounting: true,
            stockAlerts: true
        }
    },
    starter: {
        name: 'Starter',
        title: 'Small shops',
        price: 499,
        tagline: 'Best for single-counter shops and boutiques.',
        maxProducts: 500,
        maxStaff: 2,
        maxInvoicesPerMonth: 1000,
        bulletPoints: [
            'Up to 500 products',
            '2 staff/cashier accounts',
            '1,000 invoices/month',
            'POS billing and receipts',
            'Basic inventory management',
            'Priority support'
        ],
        features: {
            posBilling: true,
            basicInventory: true,
            thermalPrint: false,
            barcodeGenerator: false,
            advancedAccounting: false,
            stockAlerts: false,
            prioritySupport: true
        }
    },
    growth: {
        name: 'Growth',
        title: 'Most popular',
        price: 1499,
        tagline: 'Best for supermarkets, pharmacies and busy retailers.',
        maxProducts: 5000,
        maxStaff: 5,
        maxInvoicesPerMonth: 10000,
        bulletPoints: [
            'Up to 5,000 products',
            '5 staff/cashier accounts',
            '10,000 invoices/month',
            'Thermal printing (58mm/80mm)',
            'Barcode label generator',
            'Stock reports and low-stock alerts',
            'Priority support'
        ],
        features: {
            posBilling: true,
            basicInventory: true,
            thermalPrint: true,
            barcodeGenerator: true,
            advancedAccounting: false,
            stockAlerts: true,
            prioritySupport: true
        }
    },
    enterprise: {
        name: 'Enterprise',
        title: 'Growing businesses',
        price: 3499,
        tagline: 'Best for wholesalers and multi-store businesses.',
        maxProducts: 999999,
        maxStaff: 50,
        maxInvoicesPerMonth: 999999,
        bulletPoints: [
            'Unlimited products',
            'Up to 50 staff accounts',
            'Unlimited invoices and PDF generation',
            'Advanced accounting and P&L reports',
            'Multi-store management',
            'Priority support'
        ],
        features: {
            posBilling: true,
            basicInventory: true,
            thermalPrint: true,
            barcodeGenerator: true,
            advancedAccounting: true,
            stockAlerts: true,
            multiStore: true,
            prioritySupport: true
        }
    }
};

// Public Webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    res.json({ received: true });
});

// Authenticated Subscription Endpoints
router.use(verifyToken);

// GET /api/subscription/current - Get current plan & real-time quota
router.get('/current', async (req, res) => {
    try {
        const business = await Business.findById(req.businessId);
        if (!business) return res.status(404).json({ error: 'Business not found' });

        const [productCount, staffCount, invoiceCount] = await Promise.all([
            Product.countDocuments({ businessId: req.businessId }),
            User.countDocuments({ businessId: req.businessId, role: { $in: ['manager', 'cashier'] } }),
            Invoice.countDocuments({ 
                businessId: req.businessId,
                date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
            })
        ]);

        const currentPlanKey = business.subscription?.plan || 'trial';
        const planConfig = PLAN_LIMITS[currentPlanKey] || PLAN_LIMITS.starter;

        res.json({
            subscription: business.subscription,
            limits: business.limits,
            features: planConfig.features,
            usage: {
                products: productCount,
                staff: staffCount,
                monthlyInvoices: invoiceCount
            },
            plans: PLAN_LIMITS,
            razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_HERE'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/subscription/create-order - Create Razorpay order for plan upgrade
router.post('/create-order', requireRole(['owner']), async (req, res) => {
    try {
        const { plan } = req.body;
        const targetPlan = PLAN_LIMITS[plan];
        if (!targetPlan || targetPlan.price === 0) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        const amountInPaise = targetPlan.price * 100;
        const receipt = `plan_${plan}_${Date.now()}`;

        // If real Razorpay keys are configured
        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_ID.includes('YOUR_KEY')) {
            const order = await razorpay.orders.create({
                amount: amountInPaise,
                currency: 'INR',
                receipt,
                notes: { plan, businessId: req.businessId.toString() }
            });
            return res.json({
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId: process.env.RAZORPAY_KEY_ID,
                plan
            });
        }

        // Demo / test simulation mode if keys not in .env yet
        const mockOrderId = `order_${Date.now()}`;
        res.json({
            orderId: mockOrderId,
            amount: amountInPaise,
            currency: 'INR',
            keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
            plan,
            isSimulation: true
        });
    } catch (error) {
        console.error('Error creating plan order:', error);
        res.status(500).json({ error: error.message || 'Failed to create payment order' });
    }
});

// POST /api/subscription/verify-payment - Verify Razorpay signature & activate plan
router.post('/verify-payment', requireRole(['owner']), async (req, res) => {
    try {
        const { plan, razorpay_order_id, razorpay_payment_id, razorpay_signature, isSimulation } = req.body;

        const targetPlan = PLAN_LIMITS[plan];
        if (!targetPlan) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        // If not in simulation mode, verify Razorpay signature
        if (!isSimulation && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_SECRET.includes('YOUR_KEY')) {
            const sign = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSign = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(sign.toString())
                .digest("hex");

            if (razorpay_signature !== expectedSign) {
                return res.status(400).json({ error: 'Invalid payment signature. Payment verification failed.' });
            }
        }

        const business = await Business.findById(req.businessId);
        if (!business) return res.status(404).json({ error: 'Business not found' });

        business.subscription.plan = plan;
        business.subscription.status = 'active';
        business.subscription.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        business.subscription.razorpaySubscriptionId = razorpay_payment_id || `sim_${Date.now()}`;
        business.limits = {
            maxProducts: targetPlan.maxProducts,
            maxStaff: targetPlan.maxStaff,
            maxInvoicesPerMonth: targetPlan.maxInvoicesPerMonth
        };

        await business.save();

        res.json({
            success: true,
            message: `🎉 Successfully subscribed to ${targetPlan.name} Plan (₹${targetPlan.price}/month)!`,
            subscription: business.subscription,
            limits: business.limits,
            features: targetPlan.features
        });
    } catch (error) {
        console.error('Error verifying plan payment:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/subscription/upgrade - Direct simulation upgrade
router.post('/upgrade', requireRole(['owner']), async (req, res) => {
    try {
        const { plan } = req.body;
        const targetPlan = PLAN_LIMITS[plan];
        if (!targetPlan) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        const business = await Business.findById(req.businessId);
        if (!business) return res.status(404).json({ error: 'Business not found' });

        business.subscription.plan = plan;
        business.subscription.status = 'active';
        business.subscription.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        business.limits = {
            maxProducts: targetPlan.maxProducts,
            maxStaff: targetPlan.maxStaff,
            maxInvoicesPerMonth: targetPlan.maxInvoicesPerMonth
        };

        await business.save();

        res.json({
            message: `Successfully upgraded to ${targetPlan.name} Plan!`,
            subscription: business.subscription,
            limits: business.limits,
            features: targetPlan.features
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
module.exports.PLAN_LIMITS = PLAN_LIMITS;
