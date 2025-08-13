import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { NetworkContext } from "./NetworkContext.tsx";
import { getClassInfo } from "../api/modules/classesApi.ts";
import { loadClassInfoFromLocal, saveClassInfoToLocal } from "../utils/cache/Faculty/localClassInfo";

const ClassContext = createContext(null);

export const ClassProvider = ({ children, ClassID }) => {
    const [classes, setClasses] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const network = useContext(NetworkContext);
    const fetchedRef = useRef(false);

    const fetch = useCallback(async () => {
        if (loading || fetchedRef.current) return;
        setLoading(true);
        try {
            const res = await getClassInfo({ ClassID });
            setClasses(res);
            await saveClassInfoToLocal(ClassID, res);
            fetchedRef.current = true;
        } catch (error) {
            console.error("Error fetching class:", error);
        } finally {
            setLoading(false);
        }
    }, [ClassID, loading]);

    const fetchCached = useCallback(async () => {
        if (!ClassID) return;
        try {
            const { data, date } = await loadClassInfoFromLocal(ClassID);
            if (data) {
                setClasses(data);
                setLoading(false);
                return;
            }
        } catch (error) {
            await fetch();
        }
    }, [ClassID, network?.isOnline, fetch]);

    useEffect(() => {
        if (!ClassID) return;
        fetchCached();
    }, [ClassID, fetchCached]);

    return (
        <ClassContext.Provider value={{ classes, loading, loadingSubmissions, refresh: fetch }}>
            {children}
        </ClassContext.Provider>
    );
};

export const useClass = () => useContext(ClassContext);
