const admin = require('firebase-admin');
const { db } = require('./src/config/firebase');

async function seedInvoices() {
    try {
        console.log('Fetching products to link invoices...');
        const productsSnapshot = await db.collection('products').get();
        const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (products.length === 0) {
            console.error('No products found. Please seed products first.');
            return;
        }

        const getRandomProduct = () => products[Math.floor(Math.random() * products.length)];

        // Helper to get a date N days ago
        const daysAgo = (n) => {
            const d = new Date();
            d.setDate(d.getDate() - n);
            return admin.firestore.Timestamp.fromDate(d);
        };

        const invoices = [
            {
                invoiceNumber: 'INV-1001',
                customerName: 'Sahil Sharma',
                date: daysAgo(2),
                items: [
                    { productId: products[0].id, productName: products[0].name, quantity: 2, price: products[0].price, total: 2 * products[0].price },
                    { productId: products[1].id, productName: products[1].name, quantity: 5, price: products[1].price, total: 5 * products[1].price }
                ],
                totalAmount: (2 * products[0].price) + (5 * products[1].price),
                status: 'Paid'
            },
            {
                invoiceNumber: 'INV-1002',
                customerName: 'Anjali Gupta',
                date: daysAgo(5),
                items: [
                    { productId: products[2].id, productName: products[2].name, quantity: 1, price: products[2].price, total: products[2].price }
                ],
                totalAmount: products[2].price,
                status: 'Paid'
            },
            {
                invoiceNumber: 'INV-1003',
                customerName: 'Rahul Verma',
                date: daysAgo(10),
                items: [
                    { productId: products[3].id, productName: products[3].name, quantity: 2, price: products[3].price, total: 2 * products[3].price }
                ],
                totalAmount: 2 * products[3].price,
                status: 'Paid'
            }
        ];

        // Add more random recent invoices to trigger "Fast Moving" category (requires > 10 qty in 30 days)
        const fastProduct = products[0];
        invoices.push({
            invoiceNumber: 'INV-1004',
            customerName: 'Frequent Buyer',
            date: daysAgo(1),
            items: [
                { productId: fastProduct.id, productName: fastProduct.name, quantity: 15, price: fastProduct.price, total: 15 * fastProduct.price }
            ],
            totalAmount: 15 * fastProduct.price,
            status: 'Paid'
        });

        // Add some old invoices for "Dead Stock" context if needed, but the logic also checks for LACK of invoices.

        const invoicesCol = db.collection('invoices');
        const snapshot = await invoicesCol.get();
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        console.log('Cleared existing invoices.');

        for (const inv of invoices) {
            await invoicesCol.add(inv);
        }

        console.log('Invoices seeded successfully with real product IDs!');
    } catch (error) {
        console.error('Error seeding invoices:', error);
    }
}

seedInvoices();
