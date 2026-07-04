import axios from "axios";

const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const API = axios.create({
    baseURL: apiBase,
    headers: {
        "Content-Type": "application/json",
    },
});

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;