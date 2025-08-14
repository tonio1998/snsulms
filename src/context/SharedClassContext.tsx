import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getClassInfo } from "../api/modules/classesApi.ts";
import { loadClassInfoFromLocal, saveClassInfoToLocal } from "../utils/cache/Faculty/localClassInfo";
import { handleApiError } from "../utils/errorHandler.ts";

const ClassContext = createContext(null);

export const ClassProvider = ({ children, ClassID }) => {
    const [classes, setClasses] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const fetchedRef = useRef(false);

    const fetchClass = useCallback(async (force = false) => {
        if (!ClassID) return;
        if (loading) return;
        if (!force && fetchedRef.current) return;

        setLoading(true);
        try {
            if (!force) {
                const cached = await loadClassInfoFromLocal(ClassID);
                if (cached?.data) {
                    setClasses(cached.data);
                    fetchedRef.current = true;
                    setLoading(false);
                    return;
                }
            }

            const res = await getClassInfo({ ClassID });
            console.log("🔍 Fetched class info", res);
            setClasses(res);
            await saveClassInfoToLocal(ClassID, res);
            fetchedRef.current = true;
        } catch (error) {
            handleApiError(error, "Fetch Class Info");
        } finally {
            setLoading(false);
        }
    }, [ClassID, loading]);

    useEffect(() => {
        fetchClass();
    }, [fetchClass]);

    return (
        <ClassContext.Provider
            value={{
                classes,
                loading,
                loadingSubmissions,
                refresh: () => fetchClass(true),
            }}
        >
            {children}
        </ClassContext.Provider>
    );
};

export const useClass = () => useContext(ClassContext);
