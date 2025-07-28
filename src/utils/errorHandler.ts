import { ENABLE_DEBUG } from "../../env.ts";

const isDebugEnabled = ENABLE_DEBUG;

export function handleApiError(error: any, context: string = 'API Error') {
    if (!isDebugEnabled) return;

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
