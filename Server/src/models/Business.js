const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    category: { 
        type: String, 
        enum: ['retail', 'pharmacy', 'supermarket', 'electronics', 'clothing', 'wholesale', 'other'], 
        default: 'retail' 
    },
    currency: { type: String, default: 'INR' },
    taxNumber: { type: String, default: '' }, // GSTIN, VAT, or Tax ID
    taxRate: { type: Number, default: 0 },
    logoUrl: { type: String, default: '' },
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' },
        country: { type: String, default: '' }
    },
    subscription: {
        plan: { type: String, enum: ['trial', 'starter', 'growth', 'enterprise'], default: 'trial' },
        status: { type: String, enum: ['active', 'past_due', 'canceled', 'trialing'], default: 'trialing' },
        trialEndsAt: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }, // 14-day trial
        validUntil: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
        razorpaySubscriptionId: { type: String, default: '' },
        razorpayCustomerId: { type: String, default: '' }
    },
    limits: {
        maxProducts: { type: Number, default: 50 },
        maxStaff: { type: Number, default: 2 },
        maxInvoicesPerMonth: { type: Number, default: 200 }
    },
    invoiceSettings: {
        template: { type: String, enum: ['modern', 'classic', 'minimal', 'thermal'], default: 'modern' },
        primaryColor: { type: String, default: '#2563EB' },
        accentColor: { type: String, default: '#06B6D4' },
        paperSize: { type: String, enum: ['A4', 'letter', 'thermal_80mm', 'thermal_58mm'], default: 'A4' },
        showGstBreakdown: { type: Boolean, default: true },
        showHsn: { type: Boolean, default: true },
        showBankDetails: { type: Boolean, default: true },
        showUpiQr: { type: Boolean, default: true },
        bankDetails: {
            accountName: { type: String, default: '' },
            accountNumber: { type: String, default: '' },
            bankName: { type: String, default: '' },
            ifsc: { type: String, default: '' },
            upiId: { type: String, default: '' }
        },
        termsAndConditions: { 
            type: String, 
            default: '1. Goods once sold will not be returned.\n2. Invoices are due within 15 days.\n3. Subject to local jurisdiction.' 
        },
        customFooterNote: { type: String, default: 'Thank you for your business!' }
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Business', businessSchema);
