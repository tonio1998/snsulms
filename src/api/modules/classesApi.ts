import api from "../api.ts";

export const getMyClasses = async ({ page = 1, search = '', AcademicYear, StudentID }) => {
    const response = await api.get('/lms/myclasses', {
        params: { page, search, AcademicYear, StudentID }
    });
    return response.data;
};

export const getFacClasses = async ({ page = 1, search = '', AcademicYear }) => {
    const response = await api.get('/lms/myclasses/fac/list', {
        params: { page, search, AcademicYear }
    });
    return response.data;
};

export const updateClassCode = async (ClassID) => {
    const res = await api.put('/lms/myclasses/class-code', {
        ClassID
    });
    return res.data;
};

export const addClass = async (form) => {
    const res = await api.post('/lms/class/add', form);
    return res.data;
};
export const joinClassByCode = async (classCode: string) => {
    const res = await api.post('/lms/class/join', { classCode });
    return res.data;
};

export const getClassInfo = async (ClassID) => {
  const res = await api.get('/lms/class', {
      params: {ClassID}
  });
  return res.data;
};


export const updateClassSetting = async (ClassID, key, newValue) => {
    const res = await api.put('/lms/myclasses/settings', {
        ClassID,
        key,
        value: newValue,
    });
    return res.data;
};


export const addClassAttendance = async (payload: {
    student_id: string;
    class_id: number;
    user_id: number;
    scanned_at: string;
}) => {
    try {
        const response = await api.post(`/lms/myclasses/class-attendance`, payload);
        return response.data;
    } catch (error) {
        throw error; // handled elsewhere via handleApiError
    }
};