const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    dueBalance: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

customerSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

customerSchema.index({ businessId: 1, phone: 1 });

module.exports = mongoose.model('Customer', customerSchema);
