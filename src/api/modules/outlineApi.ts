import api from "../api.ts";

export const getOutline = async (ClassID) => {
    const response = await api.get('/lms/myclasses/outline/list', {
        params: { ClassID }
    });
    return response.data;
};

export const addOutline = async (outline) => {
    const response = await api.post('/lms/myclasses/outline/add', outline);
    return response.data;
};

export const updateOutline = async (outline) => {
    const response = await api.put('/lms/myclasses/outline/update', outline);
    return response.data;
};