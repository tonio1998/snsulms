import api from "../api.ts";

export const getRoles  = async () => {
	const response = await api.get('/roles/');
	return response.data;
}
