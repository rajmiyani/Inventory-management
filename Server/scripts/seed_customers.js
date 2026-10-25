const mongoose = require('mongoose');
const Customer = require('../src/models/Customer');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Inventory';

const customers = [
    { name: 'Aditi Sharma', email: 'aditi.sharma@email.com', phone: '9876543210', address: 'A-45, Green Park, New Delhi' },
    { name: 'Rajesh Kumar', email: 'rajesh.k@gmail.com', phone: '9123456780', address: 'Flat 202, Sunrise Apartments, Mumbai' },
    { name: 'Priya Patel', email: 'priya.patel@outlook.com', phone: '9988776655', address: '12/B, Satellite Road, Ahmedabad' },
    { name: 'Vikram Singh', email: 'vikram.pro@yahoo.com', phone: '9443322110', address: 'H.No 78, Civil Lines, Jaipur' },
    { name: 'Sneha Rao', email: 'sneha.rao@company.in', phone: '9556677889', address: 'Plot 4, Madhapur, Hyderabad' },
    { name: 'Arjun Das', email: 'arjun.das@cloud.com', phone: '9332211004', address: 'Block C, Salt Lake, Kolkata' },
    { name: 'Kavita Iyer', email: 'kavita.i@service.net', phone: '9221100334', address: 'Indiranagar 1st Stage, Bengaluru' },
    { name: 'Rohan Mehta', email: 'rohan.m@work.com', phone: '9001122334', address: 'Sector 15, Vashi, Navi Mumbai' },
    { name: 'Ananya Gupta', email: 'ananya.g@edu.in', phone: '9112233445', address: 'Model Town, Ludhiana' },
    { name: 'Sanjay Verma', email: 'sanjay.v@retail.com', phone: '9665544332', address: 'M.G. Road, Pune' },
    { name: 'Ishani Malhotra', email: 'ishani.m@fast.com', phone: '9778899001', address: 'Gomti Nagar, Lucknow' },
    { name: 'Rahul Chawla', email: 'rahul.c@tech.io', phone: '9880011223', address: 'Bani Park, Jaipur' },
    { name: 'Meera Nair', email: 'meera.nair@health.org', phone: '9440055667', address: 'Kovalam Road, Trivandrum' },
    { name: 'Amitabh Bhatt', email: 'amitabh.b@legal.in', phone: '9551122334', address: 'Dehradun Road, Rishikesh' },
    { name: 'Sonal Jain', email: 'sonal.j@design.com', phone: '9110022334', address: 'Malviya Nagar, Indore' }
];

const seedCustomers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for seeding customers...');

        await Customer.deleteMany({});
        console.log('Cleared existing customers.');

        await Customer.insertMany(customers);
        console.log(`Successfully seeded ${customers.length} customers!`);

        process.exit();
    } catch (error) {
        console.error('Error seeding customers:', error);
        process.exit(1);
    }
};

seedCustomers();
