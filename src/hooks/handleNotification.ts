import { sendNotification } from '../api/modules/userApi.ts';

function ErrorHandler(error: any, context: string = 'API Error') {
    
    if (error.response) {
        console.error(`[${context}] Response Error:`, {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
        });
    } else if (error.request) {
        console.error(`[${context}] No response received:`, error.request);
    } else {
        console.error(`[${context}] Error setting up request:`, error.message);
    }
    
    console.error(`[${context}] Full error object:`, error);
}

export const handleNotification = async (userID, title, body, screen = null, extraData = {}) => {
    try {
        await sendNotification(userID, title, body, screen, extraData);
    } catch (error) {
        ErrorHandler(error, 'Send Notification');
    }
};
