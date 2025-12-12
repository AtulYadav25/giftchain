import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        return Promise.reject(new Error(message));
    }
);

export function extractData<T>(response: { data: T }) {
    return response.data;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
