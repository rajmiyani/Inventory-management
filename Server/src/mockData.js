// Simple in-memory data store for demonstration
// In a real production app, this would be replaced by Firestore calls

const products = [
    { id: '1', name: 'Paracetamol 500mg', category: 'Tablets', price: 5.50, stock: 1500, lowStockThreshold: 200 },
    { id: '2', name: 'Amoxicillin 250mg', category: 'Antibiotics', price: 12.00, stock: 450, lowStockThreshold: 50 },
    { id: '3', name: 'N95 Medical Mask', category: 'Surgical', price: 1.50, stock: 5000, lowStockThreshold: 500 },
    { id: '4', name: 'Digital Thermometer', category: 'Device', price: 35.00, stock: 45, lowStockThreshold: 10 },
    { id: '5', name: 'Cough Syrup 100ml', category: 'Syrup', price: 8.99, stock: 120, lowStockThreshold: 20 },
    { id: '6', name: 'Insulin Syringe', category: 'Surgical', price: 0.50, stock: 2000, lowStockThreshold: 300 },
    { id: '7', name: 'Vitamin C 500mg', category: 'Supplements', price: 15.00, stock: 300, lowStockThreshold: 40 },
    { id: '8', name: 'Bandage Roll 4 inch', category: 'First Aid', price: 2.50, stock: 150, lowStockThreshold: 30 },
    { id: '9', name: 'Ibuprofen 400mg', category: 'Pain Relief', price: 6.00, stock: 300, lowStockThreshold: 40 },
    { id: '10', name: 'Surgical Gloves (Pair)', category: 'Surgical', price: 0.80, stock: 1000, lowStockThreshold: 100 },
    { id: '11', name: 'Antispetic Liquid 500ml', category: 'First Aid', price: 7.50, stock: 100, lowStockThreshold: 10 },
    { id: '12', name: 'Cotton Wool 500g', category: 'Supplies', price: 3.00, stock: 200, lowStockThreshold: 20 },
    { id: '13', name: 'Cetirizine 10mg', category: 'Tablets', price: 4.50, stock: 800, lowStockThreshold: 100 },
    { id: '14', name: 'Omeprazole 20mg', category: 'Tablets', price: 15.00, stock: 350, lowStockThreshold: 50 },
    { id: '15', name: 'Metformin 500mg', category: 'Tablets', price: 10.00, stock: 1200, lowStockThreshold: 200 },
    { id: '16', name: 'Atorvastatin 10mg', category: 'Tablets', price: 18.50, stock: 400, lowStockThreshold: 40 },
    { id: '17', name: 'Lisinopril 10mg', category: 'Tablets', price: 9.00, stock: 600, lowStockThreshold: 80 },
    { id: '18', name: 'Salbutamol Inhaler', category: 'Respiratory', price: 25.00, stock: 150, lowStockThreshold: 25 },
    { id: '19', name: 'ORS Powder (Box)', category: 'Supplements', price: 12.00, stock: 250, lowStockThreshold: 30 },
    { id: '20', name: 'Hand Sanitizer 100ml', category: 'Supplies', price: 2.50, stock: 500, lowStockThreshold: 50 },
    { id: '21', name: 'Pulse Oximeter', category: 'Device', price: 45.00, stock: 30, lowStockThreshold: 5 },
    { id: '22', name: 'Eye Drops (Refresh)', category: 'Drops', price: 7.00, stock: 180, lowStockThreshold: 20 },
];

const invoices = [];

module.exports = {
    products,
    invoices
};
