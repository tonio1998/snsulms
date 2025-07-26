import api from '../api.ts';

export const saveLocationToDB = async (data: any) => {
	const response = await api.post('/user/location', data);
	return response.data;
};