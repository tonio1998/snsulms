import api from '../api.ts';

export const loadEnrollmentClasses = async ({ page = 1, AcademicYear }) => {
    const response = await api.get('/lms/main_classes', {
        params: { page, AcademicYear }
    });
    return response.data;
};