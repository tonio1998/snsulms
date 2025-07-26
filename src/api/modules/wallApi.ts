import api from "../api.ts";

export const getWall = async ({ page = 1, search = '', ClassID = '' }) => {
    const response = await api.get('/lms/myclasses/wall', {
        params: { page, search, ClassID }
    });
    return response.data;
};


export const postWall = async (data) => {
    const response = await api.post('/lms/myclasses/wall', data);
    return response.data;
};

export const postWallComment = async (data) => {
    const response = await api.post('/lms/myclasses/wall/comment', data);
    return response.data;
};

export const getWallComments = async ({ page = 1, commentable_type, commentable_id }) => {
    const response = await api.get('/lms/myclasses/wall/comments', {
        params: { page, commentable_type, commentable_id }
    });
    return response.data;
};

export const reactPost = async (id) => {
    const response = await api.post(`/lms/myclasses/wall/${id}/react`);
    return response.data;
};