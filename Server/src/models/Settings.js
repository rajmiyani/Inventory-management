const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, unique: true, index: true },
    storeName: { type: String, default: 'SmartInv Store' },
    address: { type: String, default: '' },
    contact: { type: String, default: '' },
    currency: { type: String, default: 'INR' },
    taxRate: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 }
});

module.exports = mongoose.model('Settings', settingsSchema);
