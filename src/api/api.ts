import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from '../../env.ts';
import axios from 'axios';
import { handleApiError } from "../utils/errorHandler.ts";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
		"ngrok-skip-browser-warning": "true",
	},
});

export const setAuthToken = async (token: string | null) => {
	if (token) {
		api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
		await AsyncStorage.setItem("mobile", token);
	} else {
		delete api.defaults.headers.common["Authorization"];
		await AsyncStorage.removeItem("mobile");
	}
};

api.interceptors.request.use(async (config) => {
	const token = await AsyncStorage.getItem("mobile");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		try {
			const userData = await AsyncStorage.getItem("user");
			const user = userData ? JSON.parse(userData) : null;

			const isAdmin = user?.role === 'admin';

			if (isAdmin) {
				handleApiError(error, 'Axios Interceptor');
			}
		} catch (e) {
			// fallback logging if something goes wrong
			console.warn('Error parsing user role for logging:', e);
		}

		if (error.response?.status === 401) {
			await AsyncStorage.removeItem("mobile");
			// optional: navigate to login or show alert
		}

		return Promise.reject(error);
	}
);


export default api;
