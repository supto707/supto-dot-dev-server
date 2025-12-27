const admin = require("firebase-admin");

// For production, you should use a service account JSON file.
// You can download it from Firebase Console -> Project Settings -> Service Accounts.
// Then set the path in your .env file as FIREBASE_SERVICE_ACCOUNT_PATH.

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const serviceAccountConfig = process.env.FIREBASE_SERVICE_ACCOUNT;

if (serviceAccountConfig) {
    try {
        const serviceAccount = JSON.parse(serviceAccountConfig);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("❌ Failed to initialize Firebase Admin from environment variable:", error.message);
    }
} else if (serviceAccountPath) {
    try {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error(`❌ Failed to load service account from path ${serviceAccountPath}:`, error.message);
        // Fallback or handle appropriately
        if (!admin.apps.length) {
            admin.initializeApp({
                projectId: "supto-dev"
            });
            console.warn("⚠️ Firebase Admin initialized with only Project ID as fallback.");
        }
    }
} else {
    // Fallback for development if only Project ID is available
    admin.initializeApp({
        projectId: "supto-dev"
    });
    console.warn("⚠️ Firebase Admin initialized without service account. Ensure environment credentials are set.");
}

module.exports = admin;
