import api from "../api.ts";

export const getMyClasses = async ({ page = 1, search = '' }) => {
    const response = await api.get('/lms/myclasses', {
        params: { page, search }
    });
    return response.data;
};
