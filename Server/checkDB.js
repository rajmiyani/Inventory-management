const { db } = require('./src/config/firebase');

async function checkCollections() {
    try {
        const invoicesCount = (await db.collection('invoices').count().get()).data().count;
        const purchasesCount = (await db.collection('purchases').count().get()).data().count;
        const productsCount = (await db.collection('products').count().get()).data().count;
        const customersCount = (await db.collection('customers').count().get()).data().count;

        console.log('--- Database Summary ---');
        console.log(`Invoices: ${invoicesCount}`);
        console.log(`Purchases: ${purchasesCount}`);
        console.log(`Products: ${productsCount}`);
        console.log(`Customers: ${customersCount}`);
        console.log('------------------------');
    } catch (error) {
        console.error('Error checking collections:', error);
    }
}

checkCollections();
