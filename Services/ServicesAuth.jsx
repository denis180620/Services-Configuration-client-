import axios from 'axios';

let authToken = null;

export const setAuthToken = (token) => {
    authToken = token;
};

export const getAuthToken = () => authToken; 
let currentUserId = null; 

const API_BASE_URL = 'http://localhost:5252/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

export const setUserId = (userId) => {
    currentUserId = userId;
    if (userId) {
        localStorage.setItem('userId', userId);
    } else {
        localStorage.removeItem('userId');
    }
};

export const getUserId = () => {
    if (!currentUserId) {
        currentUserId = localStorage.getItem('userId');
    }
    return currentUserId;
};

// Очистка всех данных пользователя
export const clearUserId = () => {
    currentUserId = null;
    localStorage.removeItem('userId');
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;


        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/Auth/refresh')) {
            originalRequest._retry = true;
            try {
                const response = await api.post('/Auth/refresh');
                if (response.data?.success && response.data?.accessToken) {
                    authToken = response.data.accessToken;
                    originalRequest.headers.Authorization = `Bearer ${authToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                authToken = null;
                if (window.location.pathname !== '/login') {
                    window.location.replace('/login');
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);


export const login = async (data) => {
    const response = await api.post("/Auth/login", data);
    if (response.data?.success === true && response.data?.accessToken) {
        authToken = response.data.accessToken;
         setUserId(response.data.userId);
    }
    return response.data;
}

export const register = async (userData) => {
    try {
        const response = await api.post("/Auth/register", {
            email: userData.email,
            name: userData.userName,
            password: userData.password
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}


export const refreshToken = async () => {
    const response = await api.post("/Auth/refresh");
    if (response.data?.success === true && response.data?.accessToken) {
        authToken = response.data.accessToken;
    }
    return response.data;
}

export const logout = async () => {
    try {
        await api.post('/Auth/logout');
    } finally {
        authToken = null;
        clearUserId();
    }
};

export const getCurrentUser = async () => {
    const response = await api.get('/Auth/me');
    return response.data;
};

export default api;