import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";
import { NetworkContext } from "./NetworkContext.tsx";
import { getActivityDetails } from "../api/modules/activitiesApi.ts";
import {
    loadActivityFromLocal, loadActivityToLocal,
    saveActivityToLocal,
} from "../utils/cache/Faculty/localActivity";
import { handleApiError } from "../utils/errorHandler.ts";

type ActivityContextType = {
    activity: any;
    loading: boolean;
    refreshFromOnline: () => Promise<void>;
};

const ActivityContext = createContext<ActivityContextType | undefined>(
    undefined
);

type StudActivityProviderProps = {
    children: ReactNode;
    ActivityID: string | number | null;
};

export const StudActivityProvider = ({
                                         children,
                                         ActivityID,
                                     }: StudActivityProviderProps) => {
    const [activity, setActivity] = useState<any>(null);
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
            setActivity(normalized);
            await saveActivityToLocal(ActivityID, normalized);
        } catch (error) {
            handleApiError(error, 'Fetch activity from online');
        } finally {
            setLoading(false);
        }
    };

    const loadFromCache = useCallback(async () => {
        if (!ActivityID) return;

        try {
            setLoading(true);
            const cachedData = await loadActivityToLocal(ActivityID);

            if (cachedData) {
                console.log("🔍 Fetched activity from cache", cachedData?.data);
                setActivity(cachedData?.data);
            } else {
                await refreshFromOnline();
            }
        } catch (error) {
            // await refreshFromOnline();
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadFromCache();
    }, []);

    return (
        <ActivityContext.Provider value={{ activity, loading, refreshFromOnline }}>
            {children}
        </ActivityContext.Provider>
    );
};

export const useStudActivity = () => {
    const context = useContext(ActivityContext);
    if (!context) {
        throw new Error(
            "useStudActivity must be used within a StudActivityProvider"
        );
    }
    return context;
};
