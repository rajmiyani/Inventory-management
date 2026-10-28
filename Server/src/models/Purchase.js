const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    purchaseNo: { type: String, required: true },
    date: { type: Date, default: Date.now },
    supplier: { type: String, required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        total: { type: Number, required: true }
    }],
    total: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Received', 'Cancelled'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

purchaseSchema.index({ businessId: 1, purchaseNo: 1 }, { unique: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
