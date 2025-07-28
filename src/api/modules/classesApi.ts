import api from "../api.ts";

export const getMyClasses = async ({ page = 1, search = '', AcademicYear }) => {
    const response = await api.get('/lms/myclasses', {
        params: { page, search, AcademicYear }
    });
    return response.data;
};

export const joinClassByCode = async (classCode: string) => {
    const res = await api.post('/lms/class/join', { classCode });
    return res.data;
};