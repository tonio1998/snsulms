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

export const fetchStudentSubmissions = async ({ StudentActivityID, StudentID }) => {
    const response = await api.get('/lms/submission/fetch', {
        params: { StudentActivityID, StudentID }
    });
    return response.data;
};

export const getActivityResponses = async ({ ActivityID }) => {
    const response = await api.get('/lms/submission/fetch/list', {
        params: { ActivityID }
    });
    return response.data;
};


export const turninSubmission = async ({ StudentActivityID }) => {
    const response = await api.get('/lms/submission/turnin', {
        params: { StudentActivityID }
    });
    return response.data;
};

export const fetchStudentResponses = async ({StudentActivityID}) => {
    const response = await api.get('/lms/submission/fetch/list/student', {
        params: { StudentActivityID }
    });
    return response.data;
};

export const saveStudentGrade = async ({ StudentActivityID, Grade }) => {
    const response = await api.post('/lms/submission/grade', {
        StudentActivityID,
        Grade,
    });
    return response.data;
};
