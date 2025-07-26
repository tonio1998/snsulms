import api from '../api.ts';

export const getDashData = async () => {
	const response = await api.get('/dashboard');
	return response.data;
};