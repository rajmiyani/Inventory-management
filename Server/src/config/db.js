const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Safely clean up legacy single-field unique indexes that conflict with multi-tenant compound indexes
        try {
            const db = conn.connection.db;
            const invoicesCollection = db.collection('invoices');
            const invIndexes = await invoicesCollection.indexes();
            const legacyInvIdx = invIndexes.find(idx => idx.name === 'invoiceNo_1' && Object.keys(idx.key).length === 1);
            if (legacyInvIdx) {
                await invoicesCollection.dropIndex('invoiceNo_1');
                console.log('✓ Successfully dropped legacy index invoiceNo_1 from invoices collection');
            }

            const productsCollection = db.collection('products');
            const prodIndexes = await productsCollection.indexes();
            const legacyProdIdx = prodIndexes.find(idx => idx.name === 'sku_1' && Object.keys(idx.key).length === 1);
            if (legacyProdIdx) {
                await productsCollection.dropIndex('sku_1');
                console.log('✓ Successfully dropped legacy index sku_1 from products collection');
            }
        } catch (idxErr) {
            console.log('Index migration notice:', idxErr.message);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

