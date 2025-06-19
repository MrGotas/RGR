import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use(
    config => {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    response => {
        return response;
    },
    async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry &&
            originalRequest.url !== `${API_BASE_URL}/login/` &&
            originalRequest.url !== `${API_BASE_URL}/token/refresh/`) {

            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            isRefreshing = true;

            return new Promise(async (resolve, reject) => {
                try {
                    const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {}, { withCredentials: true });
                    const newAccessToken = response.data.access_token;

                    localStorage.setItem('access_token', newAccessToken);
                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

                    processQueue(null, newAccessToken);

                    originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
                    resolve(api(originalRequest));
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    localStorage.removeItem('access_token');
                    reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            });
        }
        return Promise.reject(error);
    }
);

const handleApiError = (error) => {
    let errorMessage = 'Произошла непредвиденная ошибка.';
    let errorStatus = 500;
    let errorDetails = null;

    if (error.response) {
        errorStatus = error.response.status;
        if (error.response.data && error.response.data.detail) {
            errorMessage = error.response.data.detail;
        } else if (error.response.data && error.response.data.errors) {
            errorDetails = error.response.data.errors;
            errorMessage = Object.entries(errorDetails)
                .map(([key, value]) => {
                    let fieldName = key;
                    if (key === 'location') fieldName = 'Местоположение';
                    if (key === 'object_instance') fieldName = 'Объект';
                    if (key === 'status') fieldName = 'Статус';
                    if (key === 'brigade') fieldName = 'Номер бригады';
                    if (key === 'identifier') fieldName = 'Идентификатор';
                    if (key === 'non_field_errors') fieldName = 'Общая ошибка';
                    return `${fieldName}: ${Array.isArray(value) ? value.join(', ') : value}`;
                })
                .join('\n');
        } else if (error.response.data) {
            errorMessage = JSON.stringify(error.response.data);
        }
    } else if (error.request) {
        errorMessage = 'Нет ответа от сервера. Проверьте сетевое соединение.';
    } else {
        errorMessage = error.message;
    }

    const newError = new Error(errorMessage);
    newError.status = errorStatus;
    newError.errors = errorDetails || error.response?.data;
    return newError;
};

export const registerUser = async (userData) => {
    try {
        const response = await api.post('/register/', userData);
        localStorage.setItem('access_token', response.data.access_token);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const loginUser = async (username, password) => {
    try {
        const response = await api.post('/login/', { username, password });
        localStorage.setItem('access_token', response.data.access_token);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const logoutUser = async () => {
    try {
        await api.post('/logout/');
        localStorage.removeItem('access_token');
    } catch (error) {
        localStorage.removeItem('access_token');
        throw handleApiError(error);
    }
};

export const getProtectedResource = async (path) => {
    try {
        const response = await api.get(path);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const createApplication = async (applicationData) => {
    try {
        const response = await api.post('/applications/', applicationData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const updateApplication = async (id, applicationData) => {
    try {
        const response = await api.put(`/applications/${id}/`, applicationData);
        return response.data;
    } catch (error) {
        throw handleApiError(error);
    }
};

export const deleteApplication = async (id) => {
    try {
        await api.delete(`/applications/${id}/`);
    } catch (error) {
        throw handleApiError(error);
    }
};