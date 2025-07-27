import api from "../api.ts";

export const getUserDetails = async (id: number) => {
    const response = await api.get(`/user/${id}`);
    return response.data;
};

export const getUsers = async ({ page = 1, search = '', role = '' }) => {
	const response = await api.get('/user', {
		params: {
			page,
			search,
			role
		}
	});
	return response;
};


export const updateUser = async (id: number, data: any) => {
    const response = await api.put(`/user/${id}`, data);
    return response.data;
};

export const saveUserNfcCode = async (userID: number, tagId: string) => {
	const response = await api.post(`/user/${userID}/nfc`, {
		tag_id: tagId,
	});

	return response.data;
};

export const resetUserPassword = async (userID: number, username: string, type: string) => {
	const response = await api.post(`/user/${userID}/${username}/${type}/generate-password`);
	return response.data;
};


export const changePassword = async (id: number, data: any) => {
	const response = await api.put(`/user/${id}/change-password`, data); // custom endpoint
	return response.data;
};

export const updateUserRole = async (role: 'skilled_worker' | 'homeowner') => {
	const response = await api.post('/user/role', { role });
	return response.data;
};


export const userFavorites = async (id: number) => {
    const response = await api.get(`/user/${id}/favorites`);
    return response.data;
};

export const userAccessUpdate = async(id) => {
	const response = await api.get('user/access/' + id);
	return response.data;
};


export const updateProfilePicture = async (id: number, image: any) => {
	const formData = new FormData();
	formData.append('image', {
		uri: image.uri,
		name: image.fileName || 'profile.jpg',
		type: image.type || 'image/jpeg',
	});

	const response = await api.post(`/user/${id}/profile-picture`, formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});

	return response.data;
};

export const saveFcmToken = async (token: string) => {
	const response = await api.post('/user/save-fcm-token', { token: token });
	return response.data;
};

export const sendNotification = async (
	user_id: number | 'all',
	title: string,
	body: string,
	screen?: string,
	extra_data: Record<string, any> = {}
) => {
	const payload = {
		title,
		body,
		user_id,
		screen,
		extra_data,
	};

	const response = await api.post(`/notifications/send`, payload);
	return response.data;
};

