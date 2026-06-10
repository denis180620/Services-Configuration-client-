import axios from 'axios';
import { getAuthToken, refreshToken, getUserId } from "../Services/ServicesAuth";
let user = localStorage.getItem('userId');
const API_BASE_URL = 'http://localhost:5252/api';

// Создание axios инстанса с интерсептором для токенов
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
},
    (error) => {
        return Promise.reject(error);
    });

api.interceptors.response.use((response) => {
    return response;
},
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const response = await refreshAccessToken();
                if (response && response.success && response.accessToken) {
                    originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
                }
                return api(originalRequest);
                throw new Error('Refresh failed');
            }
            catch (refreshError) {
                window.location.href = "/login";
                return Promise.reject(error);
            }
        }
        return Promise.reject(error);
    });

/**
 * Отправка нового сообщения
 * POST: /api/Message/send
 */
export const SendMessage = async (data) => {
    try {
        const userId = getUserId();
        const response = await api.post("/Message/send", {
            userId: userId,
            recipientInfo: data.recipientInfo,  // кому отправляем (телефон/email/telegram)
            channel: data.channel,               // канал: telegram, email, vk
            content: data.content                // текст сообщения
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Повторная отправка неудачного сообщения
 * POST: /api/Message/retry/{messageId}
 */
export const RetryFailedMessage = async (messageId) => {
    try {
        const userId = getUserId();
        const response = await api.post(`/Message/retry/${messageId}`, null, {
            params: { userId: userId }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Получение статуса сообщения
 * GET: /api/Message/status/{messageId}
 */
export const GetMessageStatus = async (messageId) => {
    try {
        const userId = getUserId();
        const response = await api.get(`/Message/status/${messageId}`, {
            params: { userId: userId }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Получение истории сообщений
 * GET: /api/Message/history
 */
export const GetMessageHistory = async (status = null, limit = null) => {
    try {

        const params = {};
        if (status) params.status = status;
        if (limit) params.limit = limit;
        if (user) params.userId = user;

        const response = await api.get("/Message/history", { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Получение статистики сообщений
 * GET: /api/Message/statistics
 */
export const GetMessageStatistics = async () => {
    try {
        const userId = getUserId();
        const response = await api.get("/Message/statistics", {
            params: { userId: userId }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Очистка старых сообщений
 * DELETE: /api/Message/clean
 */
export const CleanOldMessages = async (daysToKeep = 30) => {
    try {
        const userId = getUserId();
        const response = await api.delete("/Message/clean", {
            params: {
                userId: userId,
                daysToKeep: daysToKeep
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Получение всех неудачных сообщений
 * GET: /api/Message/failed
 */
export const GetFailedMessages = async () => {
    try {
        const userId = getUserId();
        const response = await api.get("/Message/failed", {
            params: { userId: userId }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Массовая повторная отправка всех неудачных сообщений
 * POST: /api/Message/retry-all
 */
export const RetryAllFailedMessages = async () => {
    try {
        const userId = getUserId();
        const response = await api.post("/Message/retry-all", null, {
            params: { userId: userId }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

/**
 * Получение подробной информации о сообщении
 * GET: /api/Message/details/{messageId}
 */
export const GetMessageDetails = async (messageId) => {
    try {
        const userId = getUserId();
        const response = await api.get(`/Message/details/${messageId}`, {
            params: { userId: userId }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export default api;