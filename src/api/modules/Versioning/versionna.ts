import api from "../../api.ts";

export const getClassesVersion = async (params) => {
    const res = await api.get('/lms/cache/version/class', { params });
    return {
        last_updated: res.data?.last_updated ?? new Date().toISOString(),
    };
};


export const getWallVersion = async (params) => {
    const res = await api.get('/lms/cache/version/wall', { params });
    return {
        last_updated: res.data?.last_updated ?? new Date().toISOString(),
    };
};


export const getActivityVersion = async (params) => {
    const res = await api.get('/lms/cache/version/activity', { params });
    return {
        last_updated: res.data?.last_updated ?? new Date().toISOString(),
    };
};