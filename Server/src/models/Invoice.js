const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    invoiceNo: { type: String, required: true },
    date: { type: Date, default: Date.now },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, default: 'Walk-in Customer' },
    customerPhone: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cashierName: { type: String },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        sku: { type: String },
        hsnCode: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        taxRate: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        total: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['paid', 'pending', 'partial'], default: 'paid' },
    paymentMethod: { type: String, default: 'cash' },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// CRITICAL: Invoice Number is unique PER BUSINESS only
invoiceSchema.index({ businessId: 1, invoiceNo: 1 }, { unique: true });
invoiceSchema.index({ businessId: 1, date: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
