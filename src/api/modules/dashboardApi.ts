import api from '../api.ts';

export const getDashData = async ({AcademicYear}) => {
	const response = await api.get('/lms/dashboard', {
		params: { AcademicYear }
	});
	return response.data;
};