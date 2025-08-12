import AsyncStorage from '@react-native-async-storage/async-storage';
import {handleApiError} from "../../errorHandler";
const getCacheKeys = (StudentActivityID) => ({
    CACHE_KEY: `activity_cache_${StudentActivityID}`,
    CACHE_DATE_KEY: `activity_date_cache_${StudentActivityID}`,
});

export const saveActivityToLocal = async (ActivityID, data) => {
    if (!ActivityID) return null;
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(ActivityID);

    try {
        const now = new Date();
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
        await AsyncStorage.setItem(CACHE_DATE_KEY, now.toISOString());
        return now;
    } catch (err) {
        console.error('Error saving classes:', err);
        return null;
    }
};

export const loadActivityToLocal = async (ActivityID) => {
    if (!ActivityID) return { data: null, date: null };
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(ActivityID);

    try {
        const dataStr = await AsyncStorage.getItem(CACHE_KEY);
        const dateStr = await AsyncStorage.getItem(CACHE_DATE_KEY);

        return {
            data: dataStr ? JSON.parse(dataStr) : null,
            date: dateStr ? new Date(dateStr) : null,
        };
    } catch (err) {
        console.error('Error loading classes:', err);
        handleApiError(err, 'Load activity from cache');
        return { data: null, date: null };
    }
};
