import AsyncStorage from '@react-native-async-storage/async-storage';

const DASHBOARD_CACHE_KEY = 'dashboard_data';

export const saveDashboardCache = async (acadStr: string, userId: string, data: any) => {
    try {
        const existing = await AsyncStorage.getItem(DASHBOARD_CACHE_KEY);
        let allData: Record<string, any> = {};

        if (existing) {
            try {
                allData = JSON.parse(existing);
                if (typeof allData !== 'object' || Array.isArray(allData)) {
                    allData = {};
                }
            } catch {
                allData = {};
            }
        }

        if (!allData[userId]) {
            allData[userId] = {};
        }

        allData[userId][acadStr] = {
            data,
            updatedAt: new Date().toLocaleString(),
        };

        await AsyncStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(allData));
    } catch (error) {
        console.error('Error saving dashboard cache:', error);
    }
};

export const loadDashboardCache = async (acadStr: string, userId: string) => {
    try {
        const existing = await AsyncStorage.getItem(DASHBOARD_CACHE_KEY);
        if (!existing) return null;

        let allData: Record<string, any> = {};

        try {
            allData = JSON.parse(existing);
        } catch {
            return null;
        }

        return allData[userId]?.[acadStr] || null;
    } catch (error) {
        console.error('Error loading dashboard cache:', error);
        return null;
    }
};
