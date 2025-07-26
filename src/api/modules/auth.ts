import { API_BASE_URL } from "../api_configuration.ts";
import api from '../api.ts';

export const authLogin = async (requestData) => {
    try {
        const response = await api.post('/login', requestData);
        // await setAuthToken(response.data.token);
        return response;
    } catch (error) {
        // console.error('Error logging in:', error.response?.data || error.message);
        throw error;
    }
};

export const loginWithGoogle = async ({
                                          token,
                                          name,
                                          email,
                                          photo
                                      }: {
    token: string;
    name: string;
    email: string;
    photo: string;
}) => {
    console.log(`${API_BASE_URL}/auth/google`)
    return api.post(`${API_BASE_URL}/auth/google`, {
        token,
        name,
        email,
        photo
    });
};


