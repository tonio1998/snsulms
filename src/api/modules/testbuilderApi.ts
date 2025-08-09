import api from "../api.ts";

export const getTestBuilderData = async () => {
    const response = await api.get(`/survey`);
    return response.data;
};

export const getSurveyData = async (data) => {
    console.log(data);
    const response = await api.get(`/survey/info/`, {
        params: data,
    });
    return response.data;
};

export const updateSurveyData = async (SurveyID, payload) => {
    console.log(payload);
    const response = await api.put(`/survey/${SurveyID}`, payload);
    return response.data;
};