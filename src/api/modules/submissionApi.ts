import api from "../api.ts";
import {useEffect, useState} from "react";

export const uploadStudentSubmission = async (formData) => {
    try {
        const response = await api.post('/lms/student-submission/upload-attachment', formData, {
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

export const fetchStudentSubmissions = async ({ StudentActivityID }) => {
    const response = await api.get('/lms/student-submission/fetch', {
        params: { StudentActivityID }
    });
    return response.data;
};
