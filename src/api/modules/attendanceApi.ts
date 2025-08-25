import api from "../api.ts";

export const getAttendanceByClass = async ({ page = 1, search = '', ClassID }) => {
    console.log("🔍 Fetching attendance list from APIss", ClassID);
    const response = await api.get('/events/class', {
        params: { page, search, ClassID }
    });
    return response.data;
};

export const getAttendanceById = async (AttendanceID: number) => {
    const response = await api.get(`/events/${AttendanceID}`);
    return response.data;
};

export const addAttendance = async (form: any) => {
    const response = await api.post('/events/store', form);
    return response.data;
};

export const updateAttendance = async (id: number, form: any) => {
    const response = await api.put(`/events/${id}`, form);
    return response.data;
};

export const deleteAttendance = async (id: number) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
};

export const saveLogs = async (form) => {
    console.log("form: ", form)
    const response = await api.post('/events/attendance', form);
    return response.data;
};