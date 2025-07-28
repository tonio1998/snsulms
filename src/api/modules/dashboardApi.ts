import api from '../api.ts';

export const getDashData = async () => {
	const response = await api.get('/lms/dashboard');
	return response.data;
};