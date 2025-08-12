import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveClassInfoToLocal = async (ClassID, data) => {
    if (!ClassID) return null;
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(ClassID);

    try {
        const now = new Date();
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
        await AsyncStorage.setItem(CACHE_DATE_KEY, now.toISOString());
        return now;
    } catch (err) {
        console.error('Error saving class info:', err);
        return null;
    }
};

export const loadClassInfoFromLocal = async (ClassID) => {
    if (!ClassID) return { data: null, date: null };
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(ClassID);

    try {
        const dataStr = await AsyncStorage.getItem(CACHE_KEY);
        const dateStr = await AsyncStorage.getItem(CACHE_DATE_KEY);

        return {
            data: dataStr ? JSON.parse(dataStr) : null,
            date: dateStr ? new Date(dateStr) : null,
        };
    } catch (err) {
        console.error('Error loading class info:', err);
        return { data: null, date: null };
    }
};

const getCacheKeys = (ClassID) => ({
    CACHE_KEY: `class_info_cache_${ClassID}`,
    CACHE_DATE_KEY: `class_info_date_cache_${ClassID}`,
});