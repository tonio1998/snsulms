import AsyncStorage from '@react-native-async-storage/async-storage';
import {handleApiError} from "../../errorHandler";
const getCacheKeys = (UserID, ClassID) => ({
    CACHE_KEY: `events_cache_${UserID}_${ClassID}`,
    CACHE_DATE_KEY: `events_cache_date_${UserID}_${ClassID}`,
});

export const saveEventToLocal = async (UserID, ClassID, data) => {
    if (!UserID) return null;
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(UserID, ClassID);

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

export const loadEventToLocal = async (UserID, ClassID) => {
    if (!UserID) return { data: null, date: null };
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(UserID, ClassID);

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


export const updateEventToLocal = async (userId, attendanceId, updatedData) => {
    if (!userId || !attendanceId) return null;
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(userId);

    try {
        const dataStr = await AsyncStorage.getItem(CACHE_KEY);
        let events = dataStr ? JSON.parse(dataStr) : [];

        if (!Array.isArray(events)) events = [];

        const index = events.findIndex(event => event.AttendanceID === attendanceId);
        if (index !== -1) {
            events[index] = { ...events[index], ...updatedData };
        } else {
            events.push({ AttendanceID: attendanceId, ...updatedData });
        }

        const now = new Date();
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(events));
        await AsyncStorage.setItem(CACHE_DATE_KEY, now.toISOString());

        return now;
    } catch (err) {
        console.error('Error updating event:', err);
        return null;
    }
};