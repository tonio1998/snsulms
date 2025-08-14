import React, { createContext, useContext, useEffect, useState } from 'react';
import { getStudenActivityDetails } from "../api/modules/activitiesApi.ts";
import { NetworkContext } from "./NetworkContext.tsx";
import {loadStudentActivityToLocal, saveStudentActivityToLocal} from "../utils/cache/Student/localStudentActivity";
const ActivityContext = createContext(null);

export const ActivityProvider = ({ children, StudentActivityID, ActivityID }) => {
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(false);
    const network = useContext(NetworkContext);
    const refreshFromOnline = async () => {
        if (!network?.isOnline) {
            console.warn('Cannot refresh: offline');
            return;
        }

        try {
            setLoading(true);
            const res = await getStudenActivityDetails(StudentActivityID);
            const normalized = {
                ...res,
                activities: Array.isArray(res.activities) ? res.activities : [],
            };
            setActivity(normalized);
            await saveStudentActivityToLocal(StudentActivityID, normalized);
        } catch (error) {
            console.error('Error refreshing from online:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadFromCache = async () => {
        try {
            setLoading(true);
            const { data } = await loadStudentActivityToLocal(StudentActivityID);
            if (data) {
                setActivity(data);
            } else {
                await refreshFromOnline();
            }
        } catch (error) {
            console.error('Error loading from cache:', error);
            await refreshFromOnline();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFromCache();
    }, [StudentActivityID, ActivityID]);

    return (
        <ActivityContext.Provider value={{ activity, loading, refreshFromOnline }}>
            {children}
        </ActivityContext.Provider>
    );
};


export const useActivity = () => useContext(ActivityContext);
