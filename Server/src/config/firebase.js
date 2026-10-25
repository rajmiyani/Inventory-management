const admin = require('firebase-admin');
require('dotenv').config();

let db = null;
let auth = null;
let bucket = null;

try {
    const firebaseConfig = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };

    if (process.env.FIREBASE_PROJECT_ID) {
        admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig)
        });
        console.log('Firebase Admin initialized with Environment Variables.');
    } else {
        const path = require('path');
        const fs = require('fs');
        const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');

        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('Firebase Admin initialized with local Service Account Key.');
        } else {
            throw new Error('Firebase configuration missing! Set FIREBASE_PROJECT_ID in .env or add serviceAccountKey.json');
        }
    }

    db = admin.firestore();
    auth = admin.auth();
    bucket = admin.storage().bucket(`${process.env.FIREBASE_PROJECT_ID}.appspot.com`);
} catch (error) {
    console.error('CRITICAL: Firebase Admin initialization failed:', error.message);
    process.exit(1);
}

module.exports = { admin, db, auth, bucket };
