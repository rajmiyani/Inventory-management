const { db, auth } = require('./src/config/firebase');
console.log('Firebase DB initialized:', !!db);
console.log('Firebase Auth initialized:', !!auth);
if (!db) {
    console.log('Running in Mock Mode because Firebase is not configured.');
}
process.exit(0);
