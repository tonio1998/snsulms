import React, { createContext, useContext, useEffect, useState } from 'react';
import { getOfflineActivityById, saveActivitiesOffline } from '../utils/sqlite/offlineActivityService.ts';
import { getActivityDetails } from '../api/modules/activitiesApi.ts';
import { NetworkContext } from './NetworkContext.tsx';
import {handleApiError} from "../utils/errorHandler.ts";
import {useLoading} from "./LoadingContext.tsx";

const ActivityContext = createContext(null);

export const FacActivityProvider = ({ children, ActivityID }) => {
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const network = useContext(NetworkContext);
    const { showLoading, hideLoading } = useLoading();

    const fetch = async () => {
        if (loading) return;
        setLoading(true);
        showLoading('Loading activity...');
        try {
            if (network?.isOnline) {
                const res = await getActivityDetails(ActivityID);
                setActivity(res);
                await saveActivitiesOffline(ActivityID, res);
            } else {
                const cached = await getOfflineActivityById(ActivityID);
                if (cached) setActivity(cached);
            }
        } catch (_) {
        } finally {
            setLoading(false);
            hideLoading();
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    return (
        <ActivityContext.Provider value={{ activity, loading, loadingSubmissions }}>
            {children}
        </ActivityContext.Provider>
    );
};

export const useFacActivity = () => useContext(ActivityContext);
