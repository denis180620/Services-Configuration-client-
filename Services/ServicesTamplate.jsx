import axios from 'axios';
import getUserId from './ServicesAuth.jsx';

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

export const CreateTemplate = async (data) =>{
    try{
    const response = await api.post("/Template/create",{
        name: data.name,
        text: data.text,
        UserId: getUserId
        }
        );
    return response.data;
    }catch(error){
        throw error.response?.data || error.message;
    }
}

export const ListTamplate = async () =>{
    try{
        const response = await api.get("/Template/list", {UserId: getUserId});
        return response.data;
    }catch(error){
        throw error.response?.data || error.message;
    }
}
export const DeleteTamplate = async() =>{
    try{
        const response = await api.delete("/Template/delete",{
            name: data.name,
            text: data.text, 
            UserId: getUserId
        });
        return response.data;
    }catch(error){
        throw error.response?.data || error.message;
    }
}