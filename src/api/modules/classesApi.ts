import api from "../api.ts";

export const getMyClasses = async ({ page = 1, search = '', AcademicYear }) => {
    const response = await api.get('/lms/myclasses', {
        params: { page, search, AcademicYear }
    });
    return response.data;
};

export const getFacClasses = async ({ page = 1, search = '', AcademicYear }) => {
    const response = await api.get('/lms/myclasses/fac/list', {
        params: { page, search, AcademicYear }
    });
    return response.data;
};

export const addClass = async (form) => {
    const res = await api.post('/lms/class/add', form);
    return res.data;
};
export const joinClassByCode = async (classCode: string) => {
    const res = await api.post('/lms/class/join', { classCode });
    return res.data;
};

export const getClassesVersion = async (params) => {
    const res = await api.get('/lms/cache/version/class', { params });
    return {
        last_updated: res.data?.last_updated ?? new Date().toISOString(),
    };
};
