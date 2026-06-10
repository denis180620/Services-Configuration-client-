import axios from 'axios';
import { getAuthToken, refreshToken } from "../Services/ServicesAuth"; 
import getUserId from './ServicesAuth.jsx';
let currentUserId = null;
const API_BASE_URL = 'http://localhost:5252/api';

let user = localStorage.getItem('userId');

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


export const CreateContact = async (data) =>{
    try{
        const response = await api.post("/contact/create",{
        UserId: user,           
        Name: data.name,   
        Phone: data.phone, 
        NikNameTelegram: data.nikNameTelegram, 
        IdVk: data.idVk,   
        Email: data.email  
    });
    return response;
    }catch(error){
        throw error.response?.data || error.message;
    }
}

export const GetContact = async (data) =>{
    try{
        
        const response = await api.get("/Contact/contact", {
            name: data.name,
            UserId: user
        });
        return response.data;
    }catch (error) {
        throw error.response?.data || error.message;
    }
}

export const GetContacts = async () =>{
    try {
        
        const response = await api.get("/contact/getcontacts", {
            params: { UserId: user }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}

export const DeleteContact = async (data) =>{
    try {
        
        const response = await api.delete("/Contact/deletecontact", {
            params:{
            id: data.id,
            UserId: user,
            name: data.name, 
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}