import axios from 'axios';
import getUserId from './ServicesAuth.jsx';
let currentUserId = null;
const API_BASE_URL = 'http://localhost:5252/api';

// Создание axios инстанса с интерсептором для токенов
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Интерсептор для добавления токена к запросам
api.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }
);

// Интерсептор для обработки 401 ошибок
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
        const userId = getUserId();
        const params = { userId: userId };

        if (status) params.status = status;
        if (limit) params.limit = limit;

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