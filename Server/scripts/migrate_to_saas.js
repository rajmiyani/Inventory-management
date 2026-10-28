/**
 * Auto Migration Script: Single-Tenant to Multi-Tenant SaaS
 * Links existing orphan users, products, invoices, customers, and purchases to a default business.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('../src/models/Business');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Invoice = require('../src/models/Invoice');
const Customer = require('../src/models/Customer');
const Purchase = require('../src/models/Purchase');
const Settings = require('../src/models/Settings');

async function migrate() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected! Checking for orphan records...');

    // 1. Find or create an owner user
    let owner = await User.findOne({ role: { $in: ['owner', 'admin'] } });
    if (!owner) {
        owner = await User.findOne();
    }

    if (!owner) {
        console.log('No users found in database. Ready for clean multi-tenant registrations.');
        process.exit(0);
    }

    // 2. Find or create default business
    let business = await Business.findOne({ slug: 'main-store' });
    if (!business) {
        business = new Business({
            name: 'Main Business Store',
            slug: 'main-store',
            ownerId: owner._id,
            email: owner.email,
            currency: 'INR',
            subscription: {
                plan: 'enterprise',
                status: 'active',
                validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            },
            limits: { maxProducts: 99999, maxStaff: 50, maxInvoicesPerMonth: 99999 }
        });
        await business.save();
        console.log(`Created default business: ${business.name} (${business._id})`);
    }

    const businessId = business._id;

    // 3. Link orphan records
    const uRes = await User.updateMany({ businessId: { $exists: false } }, { $set: { businessId, role: 'owner' } });
    console.log(`Linked Users: ${uRes.modifiedCount}`);

    const pRes = await Product.updateMany({ businessId: { $exists: false } }, { $set: { businessId } });
    console.log(`Linked Products: ${pRes.modifiedCount}`);

    const iRes = await Invoice.updateMany({ businessId: { $exists: false } }, { $set: { businessId } });
    console.log(`Linked Invoices: ${iRes.modifiedCount}`);

    const cRes = await Customer.updateMany({ businessId: { $exists: false } }, { $set: { businessId } });
    console.log(`Linked Customers: ${cRes.modifiedCount}`);

    const purRes = await Purchase.updateMany({ businessId: { $exists: false } }, { $set: { businessId } });
    console.log(`Linked Purchases: ${purRes.modifiedCount}`);

    const sRes = await Settings.updateMany({ businessId: { $exists: false } }, { $set: { businessId } });
    console.log(`Linked Settings: ${sRes.modifiedCount}`);

    console.log('✅ Multi-tenant data migration finished successfully!');
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration error:', err.message);
    process.exit(1);
});
