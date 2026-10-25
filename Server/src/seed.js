const { db } = require('./config/firebase');
const { products } = require('./mockData');

async function seedFirestore() {
    console.log('Starting Firestore seeding...');
    const productsCol = db.collection('products');

    // Clear existing products (optional, but good for clean seed)
    const snapshot = await productsCol.get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log('Cleared existing products.');

    // Add new products
    for (const product of products) {
        const { id, ...data } = product; // Remove mock ID if you want Firestore to generate one, or use it
        // We'll use the mock ID as document ID for consistency with our previous mock-based logic
        await productsCol.doc(id).set(data);
        console.log(`Added product: ${data.name}`);
    }

    console.log('Firestore seeding complete.');
    process.exit(0);
}

seedFirestore().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
