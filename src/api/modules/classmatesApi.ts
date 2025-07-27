import api from "../api.ts";

export const getMyClassmates = async ({ page = 1, search = '', ClassID = '' }) => {
    const response = await api.get('/lms/myclasses/people', {
        params: { page, search, ClassID }
    });
    return response.data;
};
