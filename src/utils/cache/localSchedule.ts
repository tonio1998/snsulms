import AsyncStorage from '@react-native-async-storage/async-storage';
import {handleApiError} from "../errorHandler.ts";

const getCacheKeys = (userId: string, acadStr: string) => ({
    CACHE_KEY: `class_schedule_cache_${userId}_${acadStr}`,
    CACHE_DATE_KEY: `class_schedule_cache_date_${userId}_${acadStr}`,
});

export const saveScheduleCache = async (userId: string, acadStr: string, data: any) => {
    if (!userId || !acadStr) return null;
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(userId, acadStr);

    try {
        const now = new Date();
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
        await AsyncStorage.setItem(CACHE_DATE_KEY, now.toISOString());
        return now;
    } catch (err) {
        console.error('Error saving dashboard cache:', err);
        return null;
    }
};

export const loadScheduleCache = async (userId: string, acadStr: string) => {
    if (!userId || !acadStr) return { data: null, date: null };
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(userId, acadStr);

    try {
        const dataStr = await AsyncStorage.getItem(CACHE_KEY);
        const dateStr = await AsyncStorage.getItem(CACHE_DATE_KEY);

        return {
            data: dataStr ? JSON.parse(dataStr) : null,
            date: dateStr ? new Date(dateStr) : null,
        };
    } catch (err) {
        console.error('Error loading dashboard cache:', err);
        handleApiError(err, 'Load dashboard from cache');
        return { data: null, date: null };
    }
};
