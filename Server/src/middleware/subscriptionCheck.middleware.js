const Business = require('../models/Business');
const Product = require('../models/Product');
const User = require('../models/User');
const Invoice = require('../models/Invoice');

const checkProductLimit = async (req, res, next) => {
    try {
        const business = await Business.findById(req.businessId);
        if (!business) {
            return res.status(404).json({ error: 'Tenant business account not found' });
        }

        // Check subscription active status
        const isTrialActive = business.subscription.status === 'trialing' && 
            new Date(business.subscription.trialEndsAt) > new Date();
        const isPaidActive = business.subscription.status === 'active' && 
            new Date(business.subscription.validUntil) > new Date();

        if (!isTrialActive && !isPaidActive) {
            return res.status(402).json({ 
                error: 'Your subscription or trial has expired. Please upgrade your plan to add new inventory products.' 
            });
        }

        // Check product count limit
        const productCount = await Product.countDocuments({ businessId: req.businessId });
        const maxProducts = business.limits?.maxProducts || 50;

        if (productCount >= maxProducts) {
            return res.status(403).json({ 
                error: `Product catalog limit of ${maxProducts} reached for your '${business.subscription.plan}' plan. Please upgrade your tier.` 
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const checkStaffLimit = async (req, res, next) => {
    try {
        const business = await Business.findById(req.businessId);
        if (!business) {
            return res.status(404).json({ error: 'Tenant business account not found' });
        }

        const staffCount = await User.countDocuments({ businessId: req.businessId, role: { $in: ['manager', 'cashier'] } });
        const maxStaff = business.limits?.maxStaff || 2;

        if (staffCount >= maxStaff) {
            return res.status(403).json({ 
                error: `Staff account limit of ${maxStaff} reached for your current plan. Please upgrade to add more staff members.` 
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const checkInvoiceLimit = async (req, res, next) => {
    try {
        const business = await Business.findById(req.businessId);
        if (!business) {
            return res.status(404).json({ error: 'Tenant business account not found' });
        }

        const isTrialActive = business.subscription.status === 'trialing' && 
            new Date(business.subscription.trialEndsAt) > new Date();
        const isPaidActive = business.subscription.status === 'active' && 
            new Date(business.subscription.validUntil) > new Date();

        if (!isTrialActive && !isPaidActive) {
            return res.status(402).json({ 
                error: 'Your subscription or trial has expired. Please upgrade your plan to generate invoices.' 
            });
        }

        const maxInvoices = business.limits?.maxInvoicesPerMonth || 1000;
        if (maxInvoices < 99999) {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const invoiceCountThisMonth = await Invoice.countDocuments({
                businessId: req.businessId,
                date: { $gte: startOfMonth }
            });

            if (invoiceCountThisMonth >= maxInvoices) {
                return res.status(403).json({
                    error: `Monthly quota limit of ${maxInvoices} invoices reached for your '${business.subscription.plan}' plan. Please upgrade your plan.`
                });
            }
        }

        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { checkProductLimit, checkStaffLimit, checkInvoiceLimit };

