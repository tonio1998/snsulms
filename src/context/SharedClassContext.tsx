import {createContext, useCallback, useContext, useEffect, useRef, useState} from "react";
import {NetworkContext} from "./NetworkContext.tsx";
import {getClassInfo} from "../api/modules/classesApi.ts";

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
            fetchedRef.current = true;
        } catch (error) {
            console.error('Error fetching class:', error);
        } finally {
            setLoading(false);
        }
    }, [loading, ClassID]);

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
