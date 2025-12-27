const admin = require("firebase-admin");

// For production, you should use a service account JSON file.
// You can download it from Firebase Console -> Project Settings -> Service Accounts.
// Then set the path in your .env file as FIREBASE_SERVICE_ACCOUNT_PATH.

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (serviceAccountPath) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} else {
    // Fallback for development if only Project ID is available
    // Note: This may require GOOGLE_APPLICATION_CREDENTIALS env var or being on GCP.
    admin.initializeApp({
        projectId: "supto-dev"
    });
    console.warn("⚠️ Firebase Admin initialized without service account. Ensure environment credentials are set.");
}

module.exports = admin;
