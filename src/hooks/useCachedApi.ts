// hooks/useCachedApi.ts

import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

const CACHE_DURATION = 1000; // 5 mins

export const useCachedApi = ({
                                 key = [],
                                 fetcher,
                                 fallback,
                                 save,
                                 dependencies = [],
                             }: {
    key: any[],
    fetcher: () => Promise<any>,
    fallback: () => Promise<{ data: any; updatedAt?: string }>,
    save: (data: any) => Promise<void>,
    dependencies?: any[],
}) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const net = await NetInfo.fetch();
        const isOnline = net.isConnected;

        try {
            const cached = await fallback();
            const isFresh =
                cached?.updatedAt &&
                new Date().getTime() - new Date(cached.updatedAt).getTime() < CACHE_DURATION;

            if (!isOnline || isFresh) {
                setData(cached?.data ?? []);
                return;
            }

            const apiData = await fetcher();
            setData(apiData);
            await save(apiData);
        } catch (err) {
            const fallbackData = await fallback();
            setData(fallbackData?.data ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, dependencies);

    return {
        data,
        loading,
        refresh: load,
    };
};
