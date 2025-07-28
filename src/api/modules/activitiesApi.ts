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

export const getStudenActivityDetails = async (ActivityID) => {
    const response = await api.get(`/lms/myclasses/activities/students/${ActivityID}`);
    return response.data;
};

export const fetchClassAttachments = async (ActivityID : number) => {
    // console.log("Fetching attachments for activity", ActivityID);
    const response = await api.get(`/lms/submission/fetch/a`, {
        params: { ActivityID }
    });
    return response.data;
};

export const getMyActivities = async ({ search = '', ClassID = '', AcademicYear }) => {
    const response = await api.get('/lms/myclasses/activities', {
        params: { search, ClassID, AcademicYear }
    });
    return response.data;
};