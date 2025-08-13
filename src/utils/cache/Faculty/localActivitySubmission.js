import AsyncStorage from "@react-native-async-storage/async-storage";
import {handleApiError} from "../../errorHandler";

const getCacheKeys = (ActivityID) => ({
    CACHE_KEY: `activity_submission_cache_${ActivityID}`,
    CACHE_DATE_KEY: `activity_submission_date_cache_${ActivityID}`,
});

export const saveActivitySubmissionToLocal = async (ActivityID, data) => {
    if (!ActivityID) return null;
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(ActivityID);

    try {
        const now = new Date();
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
        await AsyncStorage.setItem(CACHE_DATE_KEY, now.toISOString());
        return now;
    } catch (err) {
        console.error('Error saving submissions:', err);
        return null;
    }
};


export const saveStudentActivitySubmissionToLocal = async (ActivityID, data) => {
    if (!ActivityID) return null;
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(ActivityID);

    try {
        const now = new Date();
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
        await AsyncStorage.setItem(CACHE_DATE_KEY, now.toISOString());
        return now;
    } catch (err) {
        console.error('Error saving submissions:', err);
        return null;
    }
};

export const loadActivitySubmissionToLocal = async (ActivityID) => {
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
        console.error('Error loading submissions:', err);
        handleApiError(err, 'Load submissions from cache');
        return { data: null, date: null };
    }
};

export const fetchStudentActivitySubmissions = async (ActivityID, StudentActivityID) => {
    if (!ActivityID || !StudentActivityID) {
        console.warn('Missing ActivityID or StudentActivityID');
        return null;
    }

    const { CACHE_KEY } = getCacheKeys(ActivityID);

    try {
        const dataStr = await AsyncStorage.getItem(CACHE_KEY);

        if (dataStr) {
            const submissions = JSON.parse(dataStr);
            const found = submissions.find(
                (sub) => sub.StudentActivityID === StudentActivityID
            );

            if (found) {
                return found;
            }
        }

        return null;
    } catch (err) {
        console.error('Error fetching student submission:', err);
        handleApiError(err, 'Fetch student submission');
        return null;
    }
};
