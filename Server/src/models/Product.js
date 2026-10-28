const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    hsnCode: { type: String, default: '' },
    category: { type: String, default: 'General' },
    description: { type: String },
    price: { type: Number, required: true },
    purchasePrice: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    expiryDate: { type: Date },
    unit: { type: String, default: 'pcs' },
    image: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

productSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

// CRITICAL: Ensure SKU is unique PER BUSINESS only
productSchema.index({ businessId: 1, sku: 1 }, { unique: true });
productSchema.index({ businessId: 1, name: 'text' });

module.exports = mongoose.model('Product', productSchema);
