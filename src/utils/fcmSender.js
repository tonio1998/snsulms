const admin = require("firebase-admin");

const serviceAccount = require("./server/serviceAccountKey.json");

// Initialize only once
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

/**
 * Sends a push notification to a specific device token.
 * @param {string} token - The FCM device token.
 * @param {string} title - Notification title.
 * @param {string} body - Notification body.
 * @param {object} data - Optional custom data payload.
 * @returns {Promise<object>} Firebase response.
 */
const sendPushNotification = async (token, title, body, data = {}) => {
    const message = {
        token,
        notification: {
            title,
            body,
        },
        data,
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("✅ Push sent:", response);
        return response;
    } catch (error) {
        console.error("❌ Push error:", error);
        throw error;
    }
};

module.exports = sendPushNotification;
