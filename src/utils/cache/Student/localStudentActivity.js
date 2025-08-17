import AsyncStorage from '@react-native-async-storage/async-storage';
import {handleApiError} from "../../errorHandler";
const getCacheKeys = (StudentActivityID) => ({
    CACHE_KEY: `student_activity_cache_${StudentActivityID}`,
    CACHE_DATE_KEY: `student_activity_date_cache_${StudentActivityID}`,
});

export const saveStudentActivityToLocal = async (StudentActivityID, data) => {
    if (!StudentActivityID) return null;
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(StudentActivityID);

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

export const loadStudentActivityToLocal = async (StudentActivityID) => {
    if (!StudentActivityID) return { data: null, date: null };
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(StudentActivityID);

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

export const updateStudentActivitySubmission = async (StudentActivityID, newSubmission) => {
    if (!StudentActivityID) {
        console.warn("Missing StudentActivityID");
        return null;
    }

    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(StudentActivityID);

    try {
        const dataStr = await AsyncStorage.getItem(CACHE_KEY);
        let activities = dataStr ? JSON.parse(dataStr) : [];

        if (!Array.isArray(activities)) {
            activities = [activities];
        }

        const index = activities.findIndex((a) => a.id === newSubmission.id);

        if (index !== -1) {
            activities[index] = {
                ...activities[index],
                ...newSubmission,
                updatedAt: new Date().toISOString(),
            };
        } else {
            activities.push({
                ...newSubmission,
                updatedAt: new Date().toISOString(),
            });
        }

        const now = new Date();
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(activities));
        await AsyncStorage.setItem(CACHE_DATE_KEY, now.toISOString());

        return {
            data: activities,
            date: now,
        };
    } catch (err) {
        console.error("Error updating student activity submission:", err);
        handleApiError(err, "Update student activity submission");
        return null;
    }
};
