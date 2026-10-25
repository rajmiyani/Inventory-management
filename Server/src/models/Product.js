const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    category: { type: String },
    description: { type: String },
    price: { type: Number, required: true },
    purchasePrice: { type: Number },
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

module.exports = mongoose.model('Product', productSchema);
