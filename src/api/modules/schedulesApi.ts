import api from "../api.ts";

export const getAllSchedules = async ({AcademicYear}) => {
    const response = await api.get('/lms/schedules', {
        params: { AcademicYear }
    });
    return response.data;
};