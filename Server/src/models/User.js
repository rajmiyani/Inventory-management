const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', index: true },
    role: { 
        type: String, 
        enum: ['superadmin', 'owner', 'manager', 'cashier', 'admin', 'staff'], 
        default: 'owner' 
    },
    phone: { type: String, default: '' },
    bio: { type: String, default: '' },
    status: { type: String, enum: ['active', 'suspended', 'invited'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
