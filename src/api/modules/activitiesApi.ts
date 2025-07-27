import api from "../api.ts";

export const getActivities = async ({ page = 1, search = '', ClassID = '' }) => {
    const response = await api.get('/lms/myclasses/activities', {
        params: { page, search, ClassID }
    });
    return response.data;
};

export const getStudentActivities = async ({ page = 1, search = '', ClassID = '' }) => {
    const response = await api.get('/lms/myclasses/activities/students', {
        params: { page, search, ClassID }
    });
    return response.data;
};

export const getStudenActivityDetails = async (StudentActivityID) => {
    const response = await api.get(`/lms/myclasses/activities/students/${StudentActivityID}`);
    return response.data;
};