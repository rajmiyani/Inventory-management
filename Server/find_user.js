const { db } = require('./src/config/firebase');

async function findAdmin() {
    try {
        const snapshot = await db.collection('users').limit(1).get();
        if (snapshot.empty) {
            console.log('No users found in database.');
        } else {
            const user = snapshot.docs[0].data();
            console.log('Found user:', user.email);
            console.log('Password: (Passwords are managed by Firebase Auth, but often projects use "password123" or similar for testing)');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error finding user:', error);
        process.exit(1);
    }
}

findAdmin();
