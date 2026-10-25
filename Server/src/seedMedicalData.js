const { db } = require('./config/firebase');

const medicalProducts = [
    { sku: 'MED-001', barcode: '8901072001234', name: 'Paracetamol 500mg', category: 'Tablets', price: 5.50, stock: 15, lowStockThreshold: 200, batchNumber: 'BAT-001', expiryDate: new Date('2026-12-01') },
    { sku: 'MED-002', barcode: '8901234567890', name: 'Amoxicillin 250mg', category: 'Antibiotics', price: 12.00, stock: 45, lowStockThreshold: 50, batchNumber: 'BAT-002', expiryDate: new Date('2026-03-15') },
    { sku: 'MED-003', barcode: '7611234567897', name: 'N95 Medical Mask', category: 'Surgical', price: 1.50, stock: 50, lowStockThreshold: 500, batchNumber: 'BAT-003', expiryDate: new Date('2027-01-10') },
    { sku: 'MED-004', barcode: '4001234567892', name: 'Digital Thermometer', category: 'Device', price: 35.00, stock: 8, lowStockThreshold: 10, batchNumber: 'BAT-004', expiryDate: null },
    { sku: 'MED-005', barcode: 'QR-SYRUP-COUGH-005', name: 'Cough Syrup 100ml', category: 'Syrup', price: 8.99, stock: 12, lowStockThreshold: 20, batchNumber: 'BAT-005', expiryDate: new Date('2026-03-20') },
    { sku: 'MED-006', barcode: '8901719100112', name: 'Insulin Syringe', category: 'Surgical', price: 0.50, stock: 20, lowStockThreshold: 300, batchNumber: 'BAT-006', expiryDate: new Date('2026-03-30') },
    { sku: 'MED-007', barcode: '8900000000007', name: 'Vitamin C 500mg', category: 'Supplements', price: 15.00, stock: 30, lowStockThreshold: 40, batchNumber: 'BAT-007', expiryDate: new Date('2026-06-12') },
    { sku: 'MED-008', barcode: '8900000000008', name: 'Bandage Roll 4 inch', category: 'First Aid', price: 2.50, stock: 15, lowStockThreshold: 30, batchNumber: 'BAT-008', expiryDate: null },
    { sku: 'MED-009', barcode: '8900000000009', name: 'Ibuprofen 400mg', category: 'Pain Relief', price: 6.00, stock: 30, lowStockThreshold: 40, batchNumber: 'BAT-009', expiryDate: new Date('2025-11-05') },
    { sku: 'MED-010', barcode: '8900000000010', name: 'Surgical Gloves (Pair)', category: 'Surgical', price: 0.80, stock: 85, lowStockThreshold: 100, batchNumber: 'BAT-010', expiryDate: new Date('2027-09-21') },
    { sku: 'MED-011', barcode: '8900000000011', name: 'Antispetic Liquid 500ml', category: 'First Aid', price: 7.50, stock: 5, lowStockThreshold: 10, batchNumber: 'BAT-011', expiryDate: new Date('2026-02-14') },
    { sku: 'MED-012', barcode: '8900000000012', name: 'Cotton Wool 500g', category: 'Supplies', price: 3.00, stock: 200, lowStockThreshold: 20, batchNumber: 'BAT-012', expiryDate: null },
    { sku: 'MED-013', barcode: '8900000000013', name: 'Cetirizine 10mg', category: 'Tablets', price: 4.50, stock: 80, lowStockThreshold: 100, batchNumber: 'BAT-013', expiryDate: new Date('2025-12-30') },
    { sku: 'MED-014', barcode: '8900000000014', name: 'Omeprazole 20mg', category: 'Tablets', price: 15.00, stock: 350, lowStockThreshold: 50, batchNumber: 'BAT-014', expiryDate: new Date('2026-04-18') },
    { sku: 'MED-015', barcode: '8900000000015', name: 'Metformin 500mg', category: 'Tablets', price: 10.00, stock: 120, lowStockThreshold: 200, batchNumber: 'BAT-015', expiryDate: new Date('2026-08-25') },
    { sku: 'MED-016', barcode: '8900000000016', name: 'Atorvastatin 10mg', category: 'Tablets', price: 18.50, stock: 30, lowStockThreshold: 40, batchNumber: 'BAT-016', expiryDate: new Date('2026-04-01') },
    { sku: 'MED-017', barcode: '8900000000017', name: 'Lisinopril 10mg', category: 'Tablets', price: 9.00, stock: 60, lowStockThreshold: 80, batchNumber: 'BAT-017', expiryDate: new Date('2025-10-22') },
    { sku: 'MED-018', barcode: '8900000000018', name: 'Salbutamol Inhaler', category: 'Respiratory', price: 25.00, stock: 150, lowStockThreshold: 25, batchNumber: 'BAT-018', expiryDate: new Date('2026-07-07') },
    { sku: 'MED-019', barcode: '8900000000019', name: 'ORS Powder (Box)', category: 'Supplements', price: 12.00, stock: 250, lowStockThreshold: 30, batchNumber: 'BAT-019', expiryDate: new Date('2026-03-25') },
    { sku: 'MED-020', barcode: '8900000000020', name: 'Hand Sanitizer 100ml', category: 'Supplies', price: 2.50, stock: 500, lowStockThreshold: 50, batchNumber: 'BAT-020', expiryDate: new Date('2027-05-01') },
    { sku: 'MED-021', barcode: '8900000000021', name: 'Pulse Oximeter', category: 'Device', price: 45.00, stock: 3, lowStockThreshold: 5, batchNumber: 'BAT-021', expiryDate: null },
    { sku: 'MED-022', barcode: '8900000000022', name: 'Eye Drops (Refresh)', category: 'Drops', price: 7.00, stock: 180, lowStockThreshold: 20, batchNumber: 'BAT-022', expiryDate: new Date('2025-09-09') },
    { sku: 'MED-023', barcode: '8900000000023', name: 'Aspirin 100mg', category: 'Tablets', price: 4.00, stock: 900, lowStockThreshold: 100, batchNumber: 'BAT-023', expiryDate: new Date('2026-11-11') },
    { sku: 'MED-024', barcode: '8900000000024', name: 'Dexamethasone 4mg', category: 'Tablets', price: 8.00, stock: 200, lowStockThreshold: 30, batchNumber: 'BAT-024', expiryDate: new Date('2025-06-30') },
    { sku: 'MED-025', barcode: '8900000000025', name: 'Azithromycin 500mg', category: 'Antibiotics', price: 22.00, stock: 150, lowStockThreshold: 20, batchNumber: 'BAT-025', expiryDate: new Date('2025-04-20') },
    { sku: 'MED-026', barcode: '8900000000026', name: 'Hand Gloves Latex (Box)', category: 'Surgical', price: 15.00, stock: 100, lowStockThreshold: 15, batchNumber: 'BAT-026', expiryDate: new Date('2028-01-01') },
    { sku: 'MED-027', barcode: '8900000000027', name: 'Adhesive Plaster', category: 'First Aid', price: 1.20, stock: 600, lowStockThreshold: 50, batchNumber: 'BAT-027', expiryDate: null },
    { sku: 'MED-028', barcode: '8900000000028', name: 'Multivitamin Syrup', category: 'Syrup', price: 10.50, stock: 140, lowStockThreshold: 25, batchNumber: 'BAT-028', expiryDate: new Date('2026-02-28') },
    { sku: 'MED-029', barcode: '8900000000029', name: 'Blood Pressure Monitor', category: 'Device', price: 120.00, stock: 4, lowStockThreshold: 5, batchNumber: 'BAT-029', expiryDate: null },
    { sku: 'MED-030', barcode: '8900000000030', name: 'Disposable Syringe 5ml', category: 'Surgical', price: 0.60, stock: 1500, lowStockThreshold: 200, batchNumber: 'BAT-030', expiryDate: new Date('2027-03-10') },
    { sku: 'MED-031', barcode: '8900000000031', name: 'Calcium + Vit D3', category: 'Supplements', price: 18.00, stock: 400, lowStockThreshold: 50, batchNumber: 'BAT-031', expiryDate: new Date('2026-10-15') },
    { sku: 'MED-032', barcode: '8900000000032', name: 'Gauze Pad 4x4', category: 'First Aid', price: 0.40, stock: 1000, lowStockThreshold: 100, batchNumber: 'BAT-032', expiryDate: null },
    { sku: 'MED-033', barcode: '8900000000033', name: 'Diclofenac Gel', category: 'Ointment', price: 9.50, stock: 180, lowStockThreshold: 20, batchNumber: 'BAT-033', expiryDate: new Date('2025-11-20') },
    { sku: 'MED-034', barcode: '8900000000034', name: 'Povidone-Iodine 100ml', category: 'First Aid', price: 6.50, stock: 90, lowStockThreshold: 15, batchNumber: 'BAT-034', expiryDate: new Date('2026-05-05') },
    { sku: 'MED-035', barcode: '8900000000035', name: 'Nebulizer Machine', category: 'Device', price: 85.00, stock: 2, lowStockThreshold: 3, batchNumber: 'BAT-035', expiryDate: null },
    { sku: 'MED-036', barcode: '8900000000036', name: 'Hydrocortisone Cream', category: 'Ointment', price: 11.00, stock: 150, lowStockThreshold: 25, batchNumber: 'BAT-036', expiryDate: new Date('2025-08-30') },
    { sku: 'MED-037', barcode: '8900000000037', name: 'Iron Supplements', category: 'Supplements', price: 14.00, stock: 320, lowStockThreshold: 40, batchNumber: 'BAT-037', expiryDate: new Date('2026-07-15') },
    { sku: 'MED-038', barcode: '8900000000038', name: 'Surgical Blade #11', category: 'Surgical', price: 1.00, stock: 500, lowStockThreshold: 50, batchNumber: 'BAT-038', expiryDate: null },
    { sku: 'MED-039', barcode: '8900000000039', name: 'Loperamide 2mg', category: 'Tablets', price: 3.50, stock: 400, lowStockThreshold: 50, batchNumber: 'BAT-039', expiryDate: new Date('2026-12-31') },
    { sku: 'MED-040', barcode: '8900000000040', name: 'Folic Acid 5mg', category: 'Supplements', price: 5.00, stock: 1000, lowStockThreshold: 100, batchNumber: 'BAT-040', expiryDate: new Date('2026-09-10') },
    { sku: 'MED-041', barcode: '8900000000041', name: 'Zinc Oxide Ointment', category: 'Ointment', price: 8.50, stock: 120, lowStockThreshold: 20, batchNumber: 'BAT-041', expiryDate: new Date('2025-12-15') },
    { sku: 'MED-042', barcode: '8900000000042', name: 'Thermometer Digital IR', category: 'Device', price: 55.00, stock: 18, lowStockThreshold: 5, batchNumber: 'BAT-042', expiryDate: null },
    { sku: 'MED-043', barcode: '8900000000043', name: 'Crepe Bandage 6 inch', category: 'First Aid', price: 4.50, stock: 80, lowStockThreshold: 15, batchNumber: 'BAT-043', expiryDate: null },
    { sku: 'MED-044', barcode: '8900000000044', name: 'Vitamin B-Complex', category: 'Supplements', price: 12.50, stock: 500, lowStockThreshold: 60, batchNumber: 'BAT-044', expiryDate: new Date('2026-04-20') },
    { sku: 'MED-045', barcode: '8900000000045', name: 'Oxygen Mask Adult', category: 'Respiratory', price: 6.00, stock: 100, lowStockThreshold: 15, batchNumber: 'BAT-045', expiryDate: null },
    { sku: 'MED-046', barcode: '8900000000046', name: 'IV Cannula 20G', category: 'Surgical', price: 2.50, stock: 300, lowStockThreshold: 40, batchNumber: 'BAT-046', expiryDate: new Date('2027-02-14') },
    { sku: 'MED-047', barcode: '8900000000047', name: 'Metronidazole 400mg', category: 'Antibiotics', price: 9.00, stock: 250, lowStockThreshold: 30, batchNumber: 'BAT-047', expiryDate: new Date('2025-10-10') },
    { sku: 'MED-048', barcode: '8900000000048', name: 'Chlorhexidine Wash', category: 'First Aid', price: 13.00, stock: 60, lowStockThreshold: 10, batchNumber: 'BAT-048', expiryDate: new Date('2026-01-25') },
    { sku: 'MED-049', barcode: '8900000000049', name: 'Burn Ointment 20g', category: 'First Aid', price: 10.00, stock: 100, lowStockThreshold: 20, batchNumber: 'BAT-049', expiryDate: new Date('2026-11-20') },
    { sku: 'MED-050', barcode: '8900000000050', name: 'Face Shield Clear', category: 'Surgical', price: 3.00, stock: 400, lowStockThreshold: 50, batchNumber: 'BAT-050', expiryDate: null },
    { sku: 'MED-051', barcode: '8900000000051', name: 'Insulin Glargine 100 IU/ml', category: 'Injection', price: 45.00, stock: 80, lowStockThreshold: 15, batchNumber: 'BAT-051', expiryDate: new Date('2026-05-20') },
    { sku: 'MED-052', barcode: '8900000000052', name: 'Enoxaparin 40mg/0.4ml', category: 'Injection', price: 125.00, stock: 50, lowStockThreshold: 10, batchNumber: 'BAT-052', expiryDate: new Date('2025-09-30') },
    { sku: 'MED-053', barcode: '8900000000053', name: 'Hepatitis B Vaccine', category: 'Injection', price: 30.00, stock: 100, lowStockThreshold: 20, batchNumber: 'BAT-053', expiryDate: new Date('2026-12-15') },
    { sku: 'MED-054', barcode: '8900000000054', name: 'Tetanus Toxoid', category: 'Injection', price: 15.00, stock: 200, lowStockThreshold: 30, batchNumber: 'BAT-054', expiryDate: new Date('2027-01-01') },
    { sku: 'MED-055', barcode: '8900000000055', name: 'Glucose Monitoring Strips (Box)', category: 'Diagnostic', price: 25.00, stock: 150, lowStockThreshold: 25, batchNumber: 'BAT-055', expiryDate: new Date('2026-06-30') },
    { sku: 'MED-056', barcode: '8900000000056', name: 'HIV Rapid Test Kit', category: 'Diagnostic', price: 12.00, stock: 60, lowStockThreshold: 10, batchNumber: 'BAT-056', expiryDate: new Date('2025-12-31') },
    { sku: 'MED-057', barcode: '8900000000057', name: 'COVID-19 Antigen Self-Test', category: 'Diagnostic', price: 8.50, stock: 500, lowStockThreshold: 100, batchNumber: 'BAT-057', expiryDate: new Date('2026-03-15') },
    { sku: 'MED-058', barcode: '8900000000058', name: 'Pregnancy Test Strip', category: 'Diagnostic', price: 5.00, stock: 300, lowStockThreshold: 40, batchNumber: 'BAT-058', expiryDate: new Date('2027-05-01') },
    { sku: 'MED-059', barcode: '8900000000059', name: 'Stethoscope 3M Littmann', category: 'Device', price: 180.00, stock: 1, lowStockThreshold: 2, batchNumber: 'BAT-059', expiryDate: null },
    { sku: 'MED-060', barcode: '8900000000060', name: 'CPR Manikin', category: 'Device', price: 450.00, stock: 5, lowStockThreshold: 1, batchNumber: 'BAT-060', expiryDate: null },
    { sku: 'MED-061', barcode: '8900000000061', name: 'Wheelchair Standard', category: 'Device', price: 320.00, stock: 8, lowStockThreshold: 2, batchNumber: 'BAT-061', expiryDate: null },
    { sku: 'MED-062', barcode: '8900000000062', name: 'Walker Folding', category: 'Device', price: 95.00, stock: 15, lowStockThreshold: 3, batchNumber: 'BAT-062', expiryDate: null },
    { sku: 'MED-063', barcode: '8900000000063', name: 'Azithromycin 250mg', category: 'Antibiotics', price: 18.00, stock: 220, lowStockThreshold: 40, batchNumber: 'BAT-063', expiryDate: new Date('2025-10-30') },
    { sku: 'MED-064', barcode: '8900000000064', name: 'Ciprofloxacin 500mg', category: 'Antibiotics', price: 14.50, stock: 300, lowStockThreshold: 50, batchNumber: 'BAT-064', expiryDate: new Date('2026-02-14') },
    { sku: 'MED-065', barcode: '8900000000065', name: 'Ceftriaxone 1g Injection', category: 'Antibiotics', price: 22.00, stock: 120, lowStockThreshold: 20, batchNumber: 'BAT-065', expiryDate: new Date('2025-12-01') },
    { sku: 'MED-066', barcode: '8900000000066', name: 'Saline Solution 0.9% 500ml', category: 'IV Fluids', price: 6.50, stock: 150, lowStockThreshold: 30, batchNumber: 'BAT-066', expiryDate: new Date('2026-11-20') },
    { sku: 'MED-067', barcode: '8900000000067', name: 'Dextrose 5% 500ml', category: 'IV Fluids', price: 7.00, stock: 100, lowStockThreshold: 20, batchNumber: 'BAT-067', expiryDate: new Date('2026-08-15') },
    { sku: 'MED-068', barcode: '8900000000068', name: 'Potassium Chloride Injection', category: 'Supplements', price: 9.00, stock: 80, lowStockThreshold: 15, batchNumber: 'BAT-068', expiryDate: new Date('2026-04-10') },
    { sku: 'MED-069', barcode: 'QR-SYRUP-DEXTRO-069', name: 'Dextromethorphan HBr Syrup', category: 'Syrup', price: 12.50, stock: 100, lowStockThreshold: 20, batchNumber: 'BAT-069', expiryDate: new Date('2026-11-20') },
    { sku: 'MED-070', barcode: 'QR-SYRUP-PHENYL-070', name: 'Phenylephrine HCL Syrup', category: 'Syrup', price: 10.00, stock: 80, lowStockThreshold: 15, batchNumber: 'BAT-070', expiryDate: new Date('2026-10-15') },
    { sku: 'MED-071', barcode: '8901234567811', name: 'Multivitamin Tablets (60s)', category: 'Supplements', price: 28.00, stock: 180, lowStockThreshold: 25, batchNumber: 'BAT-069', expiryDate: new Date('2027-02-28') },
    { sku: 'MED-072', barcode: '8901234567822', name: 'Omega-3 Fish Oil 1000mg', category: 'Supplements', price: 35.00, stock: 140, lowStockThreshold: 20, batchNumber: 'BAT-070', expiryDate: new Date('2026-12-30') },
    { sku: 'MED-073', barcode: 'QR-SERUM-VITA-073', name: 'VITARICHE GLOSS HAIR SERUM', category: 'Hair Care', price: 25.00, stock: 50, lowStockThreshold: 10, batchNumber: 'BAT-073', expiryDate: new Date('2027-05-15') }
];

async function seedMedicalData() {
    console.log('Starting medical inventory data seeding with SKU & Barcode separation...');
    const productsCol = db.collection('products');

    try {
        const snapshot = await productsCol.get();
        const batchSize = 500;
        let batch = db.batch();
        let count = 0;

        for (const doc of snapshot.docs) {
            batch.delete(doc.ref);
            count++;
            if (count % batchSize === 0) {
                await batch.commit();
                batch = db.batch();
            }
        }
        await batch.commit();
        console.log('Cleared existing products.');

        // Add products
        for (const product of medicalProducts) {
            await productsCol.add(product);
            console.log(`Added: ${product.name} (SKU: ${product.sku}, Barcode: ${product.barcode})`);
        }

        console.log('Medical inventory seeding complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
}

seedMedicalData();
