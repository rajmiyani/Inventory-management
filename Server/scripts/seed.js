const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../src/models/Product');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const categories = [
    { name: 'Pharmacy', prefix: 'PHAR' },
    { name: 'Electronics', prefix: 'ELEC' },
    { name: 'General Store', prefix: 'GEN' },
    { name: 'Stationery', prefix: 'STAT' },
    { name: 'Home Appliances', prefix: 'HOME' }
];

const items = {
    'Pharmacy': ['Paracetamol', 'Amoxicillin', 'Vitamin C', 'Cough Syrup', 'Aspirin', 'Bandages', 'Antiseptic', 'Face Masks', 'Hand Sanitizer', 'Thermometer'],
    'Electronics': ['USB Cable', 'Power Bank', 'Wired Earphones', 'Wireless Mouse', 'Keyboard', 'Charging Brick', 'HDMI Cable', 'LED Bulb', 'Smart Switch', 'Laptop Stand'],
    'General Store': ['Milk Powder', 'Cooking Oil', 'Green Tea', 'Dish Soap', 'Laundry Detergent', 'Toothpaste', 'Shampoo', 'Soap Bar', 'Biscuits', 'Napkins'],
    'Stationery': ['Notebook A5', 'Gel Pen Blue', 'Ball Pen Black', 'Pencil HB', 'Eraser Large', 'Ruler 30cm', 'Marker Pen', 'Sticky Notes', 'Paper Clips', 'Folder A4'],
    'Home Appliances': ['Electric Kettle', 'Toaster', 'Iron Box', 'Hair Dryer', 'Portable Fan', 'Mixer Grinder', 'Induction Cooker', 'Coffee Maker', 'Juicer', 'Rice Cooker']
};

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Inventory');
        console.log('Connected to MongoDB for seeding...');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products.');

        const products = [];

        for (let i = 1; i <= 210; i++) {
            const categoryObj = categories[Math.floor(Math.random() * categories.length)];
            const categoryItems = items[categoryObj.name];
            const itemName = categoryItems[Math.floor(Math.random() * categoryItems.length)];

            const product = {
                name: `${itemName} ${categoryObj.prefix}-${i}`,
                sku: `${categoryObj.prefix}-${1000 + i}`,
                category: categoryObj.name,
                price: parseFloat((Math.random() * 500 + 10).toFixed(2)),
                purchasePrice: parseFloat((Math.random() * 300 + 5).toFixed(2)),
                stock: Math.floor(Math.random() * 100) + 5,
                unit: i % 5 === 0 ? 'kg' : 'pcs',
                lowStockThreshold: 10,
                description: `High-quality ${itemName} from the ${categoryObj.name} category. Professional grade for daily use.`
            };
            products.push(product);
        }

        await Product.insertMany(products);
        console.log(`Successfully seeded ${products.length} products!`);

        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedData();
