import React, { createContext, useContext, useEffect, useState } from 'react';
import {getOfflineActivityById, saveActivitiesOffline} from "../utils/sqlite/offlineActivityService.ts";
import {getStudenActivityDetails} from "../api/modules/activitiesApi.ts";
import {NetworkContext} from "./NetworkContext.tsx";
const ActivityContext = createContext(null);

export const ActivityProvider = ({ children, StudentActivityID, ActivityID }) => {
    const [activity, setActivity] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const network = useContext(NetworkContext);
    const fetch = async () => {
        try {
            if (loading) return;
            setLoading(true);

            let cached = await getOfflineActivityById(StudentActivityID);
            let usedCache = false;

            if (cached) {
                const normalized = {
                    ...cached,
                    activities: Array.isArray(cached.activities) ? cached.activities : [],
                };
                setActivity(normalized);
                usedCache = true;
            }

            if (network?.isOnline) {
                const res = await getStudenActivityDetails(StudentActivityID);
                const normalized = {
                    ...res,
                    activities: Array.isArray(res.activities) ? res.activities : [],
                };

                if (!usedCache || JSON.stringify(cached) !== JSON.stringify(normalized)) {
                    setActivity(normalized);
                    await saveActivitiesOffline(StudentActivityID, normalized);
                }
            } else if (!cached) {
                console.warn('No data available (offline and no cache).');
            }
        } catch (error) {
        } finally {
            setLoading(false);
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

export const useActivity = () => useContext(ActivityContext);
