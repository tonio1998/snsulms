import AsyncStorage from "@react-native-async-storage/async-storage";

const getCacheKeys = (userId, acad) => ({
    CACHE_KEY: `fac_classes_cache_${userId}_${acad}`,
    CACHE_DATE_KEY: `fac_classes_cache_date_${userId}_${acad}`,
});
export const saveFacClassesToLocal = async (userId, data, acad) => {
    if (!userId) return null;
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(userId, acad);

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

export const loadFacClassesFromLocal = async (userId, acad) => {
    if (!userId) return { data: null, date: null };
    const { CACHE_KEY, CACHE_DATE_KEY } = getCacheKeys(userId, acad);

    try {
        const dataStr = await AsyncStorage.getItem(CACHE_KEY);
        const dateStr = await AsyncStorage.getItem(CACHE_DATE_KEY);

        return {
            data: dataStr ? JSON.parse(dataStr) : null,
            date: dateStr ? new Date(dateStr) : null,
        };
    } catch (err) {
        console.error('Error loading classes:', err);
        return { data: null, date: null };
    }
};