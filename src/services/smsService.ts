import axios from 'axios';
import { SEMAPHORE_API_KEY, SEMAPHORE_API_SENDER_NAME } from '../../env.ts';

const SEMAPHORE_API_URL = 'https://api.semaphore.co/api/v4/messages';
const API_KEY = SEMAPHORE_API_KEY;
const SENDER = SEMAPHORE_API_SENDER_NAME

export const sendSMS = async (phoneNumber: string, message: string) => {
    try {
        const response = await axios.post(SEMAPHORE_API_URL, {
            apikey: API_KEY,
            number: phoneNumber,
            message,
            sendername: SENDER,
        });

        console.log('SMS sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('Failed to send SMS:', error.response?.data || error.message);
        throw error;
    }
};
