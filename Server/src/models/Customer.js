const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

customerSchema.pre('save', async function () {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Customer', customerSchema);
