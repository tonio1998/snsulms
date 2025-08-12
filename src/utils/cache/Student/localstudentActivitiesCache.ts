import AsyncStorage from '@react-native-async-storage/async-storage';

const getCacheKeys = (classId, UserID) => ({
    CACHE_KEY: `student_class_activities_${classId}_${UserID}`,
    CACHE_DATE_KEY: `student_class_activities_date_${classId}_${UserID}`,
});

export const saveStudentClassActivitiesCache = async (classId, UserID, data) => {
    if (!classId) return null;
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(classId, UserID);

    try {
        const now = new Date();
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
        await AsyncStorage.setItem(CACHE_DATE_KEY, now.toISOString());
        return now;
    } catch (err) {
        console.error('Error saving student class activities cache:', err);
        return null;
    }
};

export const loadStudentClassActivitiesCache = async (classId, UserID) => {
    if (!classId) return { data: null, date: null };
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(classId, UserID);

    try {
        const dataStr = await AsyncStorage.getItem(CACHE_KEY);
        const dateStr = await AsyncStorage.getItem(CACHE_DATE_KEY);

        return {
            data: dataStr ? JSON.parse(dataStr) : null,
            date: dateStr ? new Date(dateStr) : null,
        };
    } catch (err) {
        return { data: null, date: null };
    }
};
