const { db } = require('./config/firebase');

async function seedCustomers() {
    console.log('Starting Customer seeding...');
    const customersCol = db.collection('customers');

    const sampleCustomers = [
        { name: 'Sahil Sharma', email: 'sahil@example.com', phone: '+91 98765 43210', doctorName: 'Dr. Sameer Gupta', status: 'Active', totalSpent: 1250.50, initials: 'SS', avatarColor: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Anjali Gupta', email: 'anjali@example.com', phone: '+91 98989 89898', doctorName: 'Dr. Vivek Sharma', status: 'Active', totalSpent: 850.00, initials: 'AG', avatarColor: '#10b981', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Rahul Varma', email: 'rahul@example.com', phone: '+91 91234 56789', doctorName: 'Dr. Amit Shah', status: 'Inactive', totalSpent: 2100.25, initials: 'RV', avatarColor: '#f59e0b', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Rajesh Kumar', email: 'rajesh.life@example.com', phone: '+91 98765 00001', doctorName: 'Dr. S.K. Singh', status: 'Active', totalSpent: 4500.00, initials: 'RK', avatarColor: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Priya Singh', email: 'priya.well@example.com', phone: '+91 98989 00002', doctorName: 'Dr. Neha Patel', status: 'Active', totalSpent: 3200.50, initials: 'PS', avatarColor: '#10b981', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Amit Patel', email: 'amit.patel@example.com', phone: '+91 91234 00003', doctorName: 'Dr. Rajesh Khanna', status: 'Active', totalSpent: 1200.00, initials: 'AP', avatarColor: '#f59e0b', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Sneha Reddy', email: 'sneha.reddy@example.com', phone: '+91 95555 00004', doctorName: 'Dr. Vikram Seth', status: 'Active', totalSpent: 6700.75, initials: 'SR', avatarColor: '#ec4899', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Vikram Malik', email: 'vikram.malik@example.com', phone: '+91 94444 00005', doctorName: 'Dr. Pooja Hegde', status: 'Inactive', totalSpent: 800.00, initials: 'VM', avatarColor: '#6366f1', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Neha Gupta', email: 'neha.gupta@example.com', phone: '+91 93333 00006', doctorName: 'Dr. Karan Kundra', status: 'Active', totalSpent: 2500.25, initials: 'NG', avatarColor: '#8b5cf6', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Karan Mehta', email: 'karan.mehta@example.com', phone: '+91 92222 00007', doctorName: 'Dr. Shilpa Shetty', status: 'Active', totalSpent: 5100.00, initials: 'KM', avatarColor: '#f97316', createdAt: new Date(), updatedAt: new Date() }
    ];

    // Clear existing customers
    const snapshot = await customersCol.get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log('Cleared existing customers.');

    // Add new customers
    for (const customer of sampleCustomers) {
        await customersCol.add(customer);
        console.log(`Added customer with Doctor: ${customer.doctorName}`);
    }

    console.log('Customer seeding complete.');
    process.exit(0);
}

seedCustomers().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});