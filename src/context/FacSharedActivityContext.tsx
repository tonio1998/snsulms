import React, { createContext, useContext, useEffect, useState } from 'react';
import { NetworkContext } from './NetworkContext.tsx';
import { getActivityDetails } from '../api/modules/activitiesApi.ts';
import { loadActivityToLocal, saveActivityToLocal } from '../utils/cache/Faculty/localActivity';
import {handleApiError} from "../utils/errorHandler.ts";

const ActivityContext = createContext({
    activity: null,
    loading: false,
    refreshFromOnline: async () => {},
});

export const FacActivityProvider = ({ children, ActivityID }) => {
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(false);
    const network = useContext(NetworkContext);

    const refreshFromOnline = async () => {
        if (!network?.isOnline) {
            return;
        }

        try {
            setLoading(true);
            const res = await getActivityDetails(ActivityID);
            const normalized = { ...res };
            console.log("🔍 Fetched activitydsdsds", normalized);
            setActivity(normalized);
            await saveActivityToLocal(ActivityID, normalized);
        } catch (error) {
            handleApiError(error, 'Fetch activity from online');
        } finally {
            setLoading(false);
        }
    };

    const loadFromCache = async () => {
        try {
            setLoading(true);
            const cachedData = await loadActivityToLocal(ActivityID);
            if (cachedData?.data) {
                setActivity(cachedData.data);
            } else {
                await refreshFromOnline();
            }
        } catch (error) {
            await refreshFromOnline();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!ActivityID) return;
        loadFromCache();
    }, [ActivityID]);

    return (
        <ActivityContext.Provider value={{ activity, loading, refreshFromOnline }}>
            {children}
        </ActivityContext.Provider>
    );
};

export const useFacActivity = () => {
    const context = useContext(ActivityContext);
    if (!context) {
        throw new Error('useFacActivity must be used within a FacActivityProvider');
    }
    return context;
};
