import api from "../api.ts";

export const getTestBuilderData = async () => {
    const response = await api.get(`/survey`);
    return response.data;
};

export const getSurveyData = async (data) => {
    const response = await api.get(`/survey/info/`, {
        params: data,
    });
    return response.data;
};

export const updateSurveyData = async (SurveyID, payload) => {
    const response = await api.put(`/survey/${SurveyID}`, payload);
    return response.data;
};

export const fetchSections = async (FormID) => {
    const response = await api.get(`survey/`)
}

export const addSection = async (SurveyID, payload) => {
    const response = await api.post(`/survey/${SurveyID}/sections`, payload);
    return response.data;
};

export const deleteQuestion = async (questionId) => {
    const response = await api.delete(`/survey/questions/${questionId}`);
    return response.data;
};

export const addQuestion = async (SectionID, payload) => {
    const response = await api.post(`/survey/sections/${SectionID}/questions`, payload);
    return response.data;
};

export const getQuestionInfo = async (questionId) => {
    const response = await api.get(`/survey/questions/${questionId}`);
    return response.data;
};

export const updateQuestionRequired = async (questionId, isRequired) => {
    const response = await api.put(`/survey/questions/${questionId}`, {
        isRequired,
    });
    return response.data;
};

export const initSurvey = async (SurveyID) => {
    const response = await api.post(`/survey/init/${SurveyID}`);
    return response.data;
};

export const startSurvey = async (ResponseID) => {
    const response = await api.post(`/survey/start/${ResponseID}`);
    return response.data;
};

export const endSurvey = async (ResponseID) => {
    const response = await api.post(`/survey/end/${ResponseID}`);
    return response.data;
};

export const updateSurveyTimer = async (ResponseID, RemainingTime) => {
    const response = await api.put(`/survey/timer/${ResponseID}`, {
        RemainingTime,
    });
    return response.data;
};