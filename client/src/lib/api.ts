import axios, { AxiosHeaders } from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000',
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    // Ensure headers object exists and is AxiosHeaders
    if (!config.headers || !(config.headers instanceof AxiosHeaders)) {
        config.headers = new AxiosHeaders(config.headers);
    }

    if (config.data instanceof FormData) {
        // Let browser set multipart boundary
        config.headers.delete('Content-Type');
    } else {
        config.headers.set('Content-Type', 'application/json');
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            error.response?.data?.message ||
            error.message ||
            'An unexpected error occurred';

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
    meta?: {
        total: number | null;
        page: number;
        limit: number;
        totalPages: number | null;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    error?: string;
}
