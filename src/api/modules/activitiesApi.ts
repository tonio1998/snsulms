import api from "../api.ts";

// export const getActivities = async ({ page = 1, search = '', ClassID = '' }) => {
//     const response = await api.get('/lms/myclasses/activities', {
//         params: { page, search, ClassID }
//     });
//     return response.data;
// };

export const getStudentActivities = async ({ page = 1, search = '', ClassID = '' }) => {
    console.log("🔍 Fetching activities from API", ClassID);
    const response = await api.get('/lms/myclasses/activities/students', {
        params: { page, search, ClassID }
    });
    return response.data;
};

export const getStudenActivityDetails = async (StudentActivityID) => {
    const response = await api.get(`/lms/myclasses/activities/students/${StudentActivityID}`);
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

export const getActivities = async ({ search = '', ClassID = '', AcademicYear }) => {
    const response = await api.get('/lms/myclasses/fac/activities', {
        params: { search, ClassID, AcademicYear }
    });
    return response.data;
};

export const getActivityDetails = async (ActivityID) => {
    const response = await api.get(`/lms/myclasses/fac/activities/${ActivityID}`);
    return response.data;
};

export const addActivity = async (form) => {
    const res = await api.post('/lms/myclasses/activities/add', form);
    return res.data;
};