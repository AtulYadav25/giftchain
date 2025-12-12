import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { api, extractData, type ApiResponse } from '../lib/api';
import type { User, VerifyResponse, VerifyRequestData } from '../types/auth.types';
import { toast } from 'react-hot-toast';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    message: string | null;
    error: string | null;
}

interface AuthActions {
    requestMessage: (address: string) => Promise<RequestMessageResponse>;
    verify: (data: VerifyRequestData) => Promise<VerifyResponse>;
    checkSession: () => Promise<void>;
    disconnectWallet: () => void;
    updateUsername: (username: string) => void;
}

type RequestMessageResponse = {
    nonce: number;
    userId: string;
};

const useAuthStore = create<AuthState & { actions: AuthActions }>()(
    subscribeWithSelector(                 // ✅ FIX
        devtools((set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,
            message: null,
            error: null,

            actions: {
                requestMessage: async (address): Promise<RequestMessageResponse> => {
                    set({ isLoading: true, error: null });
                    try {
                        // Send API request and get the full response
                        const res = await api.post<ApiResponse<RequestMessageResponse>>('/auth/request-message', { address });

                        const { data } = extractData(res);
                        const { nonce, userId } = data;

                        set({ isLoading: false });

                        return { nonce, userId };
                    } catch (err: any) {
                        set({ isLoading: false, error: err.message });
                        throw err;
                    }
                },

                verify: async (requestData: VerifyRequestData) => {
                    set({ isLoading: true, error: null });
                    try {
                        const res = await api.post<ApiResponse<{ user: User }>>('/auth/verify', requestData);
                        let { data } = extractData(res);
                        set({ user: data.user, isAuthenticated: true, isLoading: false });
                    } catch (err: any) {
                        set({ isLoading: false, error: err.message });
                        throw err;
                    }
                },

                checkSession: async () => {
                    set({ isLoading: true, error: null });

                    try {
                        const res = await api.get('/auth/me');
                        const { success, message, data, error } = extractData(res);
                        if (success) {
                            set({
                                user: data.user,
                                isAuthenticated: true,
                                message: message,
                                isLoading: false,
                                error: null
                            });
                        } else {
                            set({
                                user: null,
                                isAuthenticated: false,
                                message: message,
                                error: error || message,
                                isLoading: false
                            });
                        }

                    } catch (err: any) {
                        const msg = err.response?.data?.message || "Request failed";

                        set({
                            user: null,
                            isAuthenticated: false,
                            message: msg,
                            error: msg,
                            isLoading: false
                        });
                    }
                },

                disconnectWallet: () => {
                    set({ user: null, isAuthenticated: false });
                },

                updateUsername: (username: string) => {
                    set((state) => ({
                        user: state.user ? { ...state.user, username } : null
                    }));
                }
            }
        }))
    )
);

// Subscribe to changes in the "error" field
useAuthStore.subscribe(
    (state) => state.error,
    (errorValue: any) => {
        if (errorValue) {
            console.log("🔥 Auth Error Detected:", errorValue);

            // Example: show toast
            toast.error(errorValue)

            // Example: auto logout
            useAuthStore.setState({
                error: null
            });
        }
    }
);


export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAuthActions = () => useAuthStore((state) => state.actions);


export default useAuthStore;
