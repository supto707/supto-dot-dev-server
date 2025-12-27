const admin = require("../config/firebase-admin");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Find or create user in MongoDB
        let user = await User.findOne({ googleId: decodedToken.uid });

        if (!user) {
            // Basic info from token
            user = await User.create({
                googleId: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name || "Anonymous",
                avatar: decodedToken.picture || "",
                plan: "none"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Firebase Auth Error:", error);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;
