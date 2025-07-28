import api from "../api.ts";
import {useEffect, useState} from "react";

export const uploadStudentSubmission = async (formData) => {
    try {
        const response = await api.post('/lms/submission/upload-attachment', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const fetchStudentSubmissions = async ({ ActivityID }) => {
    const response = await api.get('/lms/submission/fetch', {
        params: { ActivityID }
    });
    return response.data;
};


export const turninSubmission = async ({ ActivityID }) => {
    const response = await api.get('/lms/submission/turnin', {
        params: { ActivityID }
    });
    return response.data;
};