import api from "../api.ts";

export const getActivities = async ({ page = 1, search = '', ClassID = '' }) => {
    const response = await api.get('/lms/myclasses/activities', {
        params: { page, search, ClassID }
    });
    return response.data;
};
