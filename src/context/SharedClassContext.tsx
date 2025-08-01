import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getClassInfo } from '../api/modules/classesApi.ts';
import { NetworkContext } from './NetworkContext.tsx';

const ClassContext = createContext(null);

export const ClassProvider = ({ children, ClassID }) => {
    const [classes, setClasses] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const network = useContext(NetworkContext);

    const fetch = useCallback(async () => {
        try {
            if (loading) return;
            setLoading(true);
            const res = await getClassInfo({ ClassID });
            setClasses(res);
        } catch (error) {
            console.error('Error fetching class:', error);
        } finally {
            setLoading(false);
        }
    }, [ClassID]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return (
        <ClassContext.Provider value={{ classes, loading, loadingSubmissions, refresh: fetch }}>
            {children}
        </ClassContext.Provider>
    );
};

export const useClass = () => useContext(ClassContext);
