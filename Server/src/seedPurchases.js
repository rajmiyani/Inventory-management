const { db } = require('./config/firebase');

async function seedPurchases() {
    console.log('Starting Purchase Order seeding...');
    const purchasesCol = db.collection('purchases');

    // Sample Purchase Orders
    const samples = [
        {
            supplier: 'Global Pharma Ltd',
            date: new Date('2026-01-20'),
            status: 'Received',
            itemCount: 3,
            total: 2450.00,
            items: [
                { name: 'Paracetamol 500mg', quantity: 200, price: 4.50, total: 900.00 },
                { name: 'Amoxicillin 250mg', quantity: 100, price: 10.00, total: 1000.00 },
                { name: 'Vitamin C 500mg', quantity: 50, price: 11.00, total: 550.00 }
            ],
            createdAt: new Date()
        },
        {
            supplier: 'MediTech Supplies',
            date: new Date('2026-01-22'),
            status: 'Pending',
            itemCount: 2,
            total: 1575.00,
            items: [
                { name: 'Digital Thermometer', quantity: 30, price: 30.00, total: 900.00 },
                { name: 'Pulse Oximeter', quantity: 15, price: 45.00, total: 675.00 }
            ],
            createdAt: new Date()
        },
        {
            supplier: 'Surgical Direct',
            date: new Date('2026-01-23'),
            status: 'Processing',
            itemCount: 2,
            total: 450.00,
            items: [
                { name: 'N95 Medical Mask', quantity: 200, price: 1.25, total: 250.00 },
                { name: 'Surgical Gloves (Pair)', quantity: 250, price: 0.80, total: 200.00 }
            ],
            createdAt: new Date()
        },
        { supplier: 'Merck Group', date: new Date('2026-01-25'), status: 'Received', itemCount: 1, total: 4500.00, items: [{ name: 'Insulin Glargine', quantity: 100, price: 45.00, total: 4500.00 }], createdAt: new Date() },
        { supplier: 'Pfizer Inc.', date: new Date('2026-01-26'), status: 'Received', itemCount: 2, total: 1200.00, items: [{ name: 'Amoxicillin 250mg', quantity: 50, price: 12.00, total: 600.00 }, { name: 'Azithromycin 250mg', quantity: 50, price: 12.00, total: 600.00 }], createdAt: new Date() },
        { supplier: 'Roche Holding AG', date: new Date('2026-01-27'), status: 'Pending', itemCount: 1, total: 1250.00, items: [{ name: 'Enoxaparin 40mg', quantity: 10, price: 125.00, total: 1250.00 }], createdAt: new Date() },
        { supplier: 'Novartis AG', date: new Date('2026-01-28'), status: 'Processing', itemCount: 2, total: 850.00, items: [{ name: 'Diclofenac Gel', quantity: 50, price: 9.50, total: 475.00 }, { name: 'Hydrocortisone Cream', quantity: 34, price: 11.00, total: 375.00 }], createdAt: new Date() },
        { supplier: 'AbbVie Inc.', date: new Date('2026-01-29'), status: 'Received', itemCount: 1, total: 1500.00, items: [{ name: 'Adalimumab (Simulated)', quantity: 2, price: 750.00, total: 1500.00 }], createdAt: new Date() },
        { supplier: 'Johnson & Johnson', date: new Date('2026-01-30'), status: 'Received', itemCount: 3, total: 350.00, items: [{ name: 'Surgical Gloves', quantity: 100, price: 0.80, total: 80.00 }, { name: 'Face Shield', quantity: 50, price: 3.00, total: 150.00 }, { name: 'Cotton Wool', quantity: 40, price: 3.00, total: 120.00 }], createdAt: new Date() },
        { supplier: 'Sanofi S.A.', date: new Date('2026-02-01'), status: 'Received', itemCount: 1, total: 3000.00, items: [{ name: 'Hepatitis B Vaccine', quantity: 100, price: 30.00, total: 3000.00 }], createdAt: new Date() },
        { supplier: 'Bristol-Myers Squibb', date: new Date('2026-02-02'), status: 'Pending', itemCount: 1, total: 2200.00, items: [{ name: 'Ceftriaxone 1g Injection', quantity: 100, price: 22.00, total: 2200.00 }], createdAt: new Date() },
        { supplier: 'AstraZeneca PLC', date: new Date('2026-02-03'), status: 'Processing', itemCount: 1, total: 720.00, items: [{ name: 'Atorvastatin 10mg', quantity: 40, price: 18.00, total: 720.00 }], createdAt: new Date() },
        { supplier: 'GlaxoSmithKline', date: new Date('2026-02-04'), status: 'Received', itemCount: 1, total: 3750.00, items: [{ name: 'Salbutamol Inhaler', quantity: 150, price: 25.00, total: 3750.00 }], createdAt: new Date() },
        { supplier: 'Eli Lilly', date: new Date('2026-02-05'), status: 'Received', itemCount: 1, total: 450.00, items: [{ name: 'Vitamin C 500mg', quantity: 30, price: 15.00, total: 450.00 }], createdAt: new Date() },
        { supplier: 'Gilead Sciences', date: new Date('2026-02-06'), status: 'Pending', itemCount: 1, total: 1200.00, items: [{ name: 'HIV Rapid Test Kit', quantity: 100, price: 12.00, total: 1200.00 }], createdAt: new Date() },
        { supplier: 'Bayer AG', date: new Date('2026-02-07'), status: 'Processing', itemCount: 2, total: 540.00, items: [{ name: 'Aspirin 100mg', quantity: 100, price: 4.00, total: 400.00 }, { name: 'Iron Supplements', quantity: 10, price: 14.00, total: 140.00 }], createdAt: new Date() },
        { supplier: 'Amgen Inc.', date: new Date('2026-02-08'), status: 'Received', itemCount: 1, total: 900.00, items: [{ name: 'Potassium Chloride', quantity: 100, price: 9.00, total: 900.00 }], createdAt: new Date() },
        { supplier: 'Novo Nordisk', date: new Date('2026-02-09'), status: 'Received', itemCount: 1, total: 4500.00, items: [{ name: 'Insulin Glargine', quantity: 100, price: 45.00, total: 4500.00 }], createdAt: new Date() },
        { supplier: 'Takeda Pharma', date: new Date('2026-02-10'), status: 'Pending', itemCount: 1, total: 1500.00, items: [{ name: 'Omeprazole 20mg', quantity: 100, price: 15.00, total: 1500.00 }], createdAt: new Date() },
        { supplier: 'Moderna', date: new Date('2026-02-11'), status: 'Processing', itemCount: 1, total: 4250.00, items: [{ name: 'COVID Test Kit', quantity: 500, price: 8.50, total: 4250.00 }], createdAt: new Date() },
        { supplier: 'Biogen', date: new Date('2026-02-12'), status: 'Received', itemCount: 1, total: 1400.00, items: [{ name: 'Folic Acid 5mg', quantity: 280, price: 5.00, total: 1400.00 }], createdAt: new Date() },
        { supplier: 'Regeneron', date: new Date('2026-02-13'), status: 'Received', itemCount: 1, total: 550.00, items: [{ name: 'Vitamin B-Complex', quantity: 44, price: 12.50, total: 550.00 }], createdAt: new Date() },
        { supplier: 'Vertex Pharma', date: new Date('2026-02-14'), status: 'Pending', itemCount: 1, total: 1050.00, items: [{ name: 'Multivitamin Syrup', quantity: 100, price: 10.50, total: 1050.00 }], createdAt: new Date() }
    ];

    // Clear existing purchases
    const snapshot = await purchasesCol.get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log('Cleared existing purchases.');

    // Add new ones
    for (const sample of samples) {
        await purchasesCol.add(sample);
        console.log(`Added purchase order from: ${sample.supplier}`);
    }

    console.log('Purchase Order seeding complete.');
    process.exit(0);
}

seedPurchases().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
