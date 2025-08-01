import { API_BASE_URL } from "../../../env.ts";
import api from '../api.ts';
import AsyncStorage from "@react-native-async-storage/async-storage";

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



export const fetchGenericData = async (endpoint: string) => {
    const AYFrom = AsyncStorage.getItem('AYFrom');
    const AYTo = AsyncStorage.getItem('AYTo');
    const Semester = AsyncStorage.getItem('Semester');
    const res = await api.get(`/background/${endpoint}?AYFrom=${AYFrom}&AYTo=${AYTo}&Semester=${Semester}`);
    return res.data;
};