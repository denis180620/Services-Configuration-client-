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

// Интерсептор для добавления токена к запросам
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


export const CreateTemplate = async (data) =>{
    try{
    const response = await api.post("/Template/create",{
        UserId: user,
        name: data.name,
        content: data.tamplate,
        
        }
        );
    return response.data;
    }catch(error){
        throw error.response?.data || error.message;
    }
}

export const ListTamplate = async () =>{
    try{
        const response = await api.get("/Template/list", {
            params: { userId: user }
        });
        return response.data;
    }catch(error){
        throw error.response?.data || error.message;
    }
}
export const DeleteTamplate = async(data) =>{
    try{
        const response = await api.delete("/Template/delete",{
            params:{
                name: data.name,
                content: data.content,
                UserId: user,
            }
        });
        return response.data;
    }catch(error){
        throw error.response?.data || error.message;
    }
}