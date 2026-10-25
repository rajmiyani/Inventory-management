const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    key: { type: String, default: 'system', unique: true },
    pharmacyName: { type: String, default: 'InventSys Pharmacy' },
    address: { type: String, default: '123 Pharma St, Health City' },
    contact: { type: String, default: '+1 234 567 890' },
    currency: { type: String, default: 'USD' },
    taxRate: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 10 }
});

module.exports = mongoose.model('Settings', settingsSchema);
