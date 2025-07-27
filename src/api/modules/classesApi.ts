import api from "../api.ts";

export const getMyClasses = async ({ page = 1, search = '', AcademicYear }) => {
    const response = await api.get('/lms/myclasses', {
        params: { page, search, AcademicYear }
    });
    return response.data;
};
