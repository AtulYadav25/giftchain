import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { api, extractData, type ApiResponse } from '../lib/api';
import type { User, VerifyResponse, VerifyRequestData } from '../types/auth.types';
import { toast } from 'react-hot-toast';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isSessionLoading: boolean;
    message: string | null;
    error: string | null;
}

export interface PaginationMeta {
    total: number | null;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

interface AuthActions {
    requestMessage: (address: string, chain: 'sol' | 'sui') => Promise<RequestMessageResponse>;
    verify: (data: VerifyRequestData) => Promise<VerifyResponse>;
    checkUsernameAvailability: (username: string) => Promise<boolean>;
    checkSession: () => Promise<void>;
    disconnectWallet: () => Promise<void>;
    updateProfile: (data: { username?: string; avatar?: File, banner?: File, bio?: string[], settings?: { show_gift_sent: boolean }, socials?: { platform: string; link: string }[] }) => Promise<void>;
    fetchPublicProfile: (username: string) => Promise<void>;
    fetchTopGivers: () => Promise<void>;
}

type RequestMessageResponse = {
    nonce: number;
    userId: string;
};


type UpdateProfileData = {
    username?: string;
    avatar?: File;
    banner?: File;
    bio?: string[];
    settings?: { show_gift_sent: boolean };
    socials?: { platform: string; link: string }[];
};


const mergeById = <T extends { _id: string }>(
    existing: T[],
    incoming: T[]
): T[] => {
    const map = new Map<string, T>();

    for (const item of existing) {
        map.set(item._id, item);
    }

    for (const item of incoming) {
        map.set(item._id, item);
    }

    return Array.from(map.values());
};


const useAuthStore = create<AuthState & { publicProfile: User | null; publicProfileLoading: boolean } & { actions: AuthActions } & { topGivers: User[] | [], topGiversMeta: PaginationMeta | null }>()(
    subscribeWithSelector(
        devtools((set) => ({
            user: null,
            publicProfile: null, // Public user profile state
            publicProfileLoading: false,
            isAuthenticated: false,
            topGivers: [],
            topGiversMeta: null,
            isLoading: true,
            isSessionLoading: true,
            message: null,
            error: null,

            actions: {
                requestMessage: async (address, chain): Promise<RequestMessageResponse> => {
                    set({ isLoading: true, error: null });
                    try {
                        // Send API request and get the full response
                        const res = await api.post<ApiResponse<RequestMessageResponse>>('/auth/request-message', { address, chain });

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

                checkUsernameAvailability: async (username: string) => {
                    set({ isLoading: true, error: null });
                    try {
                        const res = await api.post<ApiResponse<{ available: boolean }>>('/auth/check-username-availability', { username });
                        let { data } = extractData(res);
                        set({ isLoading: false });
                        return data.available;
                    } catch (err: any) {
                        set({ isLoading: false, error: err.message });
                        throw err;
                    }
                },

                checkSession: async () => {
                    set({ isSessionLoading: true, error: null });

                    try {
                        const res = await api.get('/auth/me');
                        const { success, message, data, error } = extractData(res);
                        if (success) {
                            set({
                                user: data.user,
                                isAuthenticated: true,
                                message: message,
                                isSessionLoading: false,
                                error: null,
                                isLoading: false
                            });
                        } else {
                            set({
                                user: null,
                                isAuthenticated: false,
                                message: message,
                                error: error || message,
                                isSessionLoading: false,
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
                            isSessionLoading: false,
                            isLoading: false
                        });
                    }
                },

                disconnectWallet: async () => {
                    try {
                        await api.get('/auth/disconnect');

                        set({ user: null, isAuthenticated: false });
                    } catch (err: any) {
                        const msg = err.response?.data?.message || err.message || "Failed to disconnect wallet";
                        set({ isLoading: false, error: msg });
                        throw err;
                    }
                },


                updateProfile: async (data: UpdateProfileData) => {
                    set({ isLoading: true, error: null });

                    try {
                        const formData = new FormData();
                        let hasAnyField = false;

                        if (data.username) {
                            formData.append('username', data.username);
                            hasAnyField = true;
                        }

                        if (data.avatar instanceof File) {
                            formData.append('avatar', data.avatar);
                            hasAnyField = true;
                        }

                        if (data.banner instanceof File) {
                            formData.append('banner', data.banner);
                            hasAnyField = true;
                        }

                        if (Array.isArray(data.bio)) {
                            formData.append('bio', JSON.stringify(data.bio));
                            hasAnyField = true;
                        }

                        // 🔥 CRITICAL FIX: allow false
                        if (data.settings && 'show_gift_sent' in data.settings) {
                            formData.append('settings', JSON.stringify({
                                show_gift_sent: data.settings.show_gift_sent,
                            }));
                            hasAnyField = true;
                        }

                        if (data.socials) {
                            formData.append('socials', JSON.stringify(data.socials));
                            hasAnyField = true;
                        }

                        // 🛑 Never send empty multipart
                        if (!hasAnyField) {
                            throw new Error('No profile changes detected');
                        }

                        const res = await api.patch<ApiResponse<{ user: User }>>(
                            '/user/profile',
                            formData
                        );

                        const { data: responseData } = extractData(res);

                        set(state => ({
                            user: state.user
                                ? { ...state.user, ...responseData.user }
                                : responseData.user,
                            isLoading: false,
                        }));

                        if (data.username) toast.success(`Username set to ${data.username}!`);
                        if (data.avatar) toast.success('Avatar updated successfully!');

                        toast.success('Profile updated successfully!');

                    } catch (err: any) {
                        const msg =
                            err.response?.data?.message ||
                            err.message ||
                            'Failed to update profile';

                        set({ error: msg, isLoading: false });
                        throw err;
                    }
                },




                fetchPublicProfile: async (username: string) => {
                    set({ publicProfileLoading: true, error: null, publicProfile: null });
                    try {
                        const res = await api.get(`/user/${username}`);
                        const { data } = extractData(res);
                        set({ publicProfile: data.user, publicProfileLoading: false });
                    } catch (err: any) {
                        // Don't set global error to avoid popping toast for everything
                        const msg = err.response?.data?.message || "User not found";
                        set({ publicProfileLoading: false, error: msg });
                        throw err;
                    }
                },

                fetchTopGivers: async (page = 1, limit = 10) => {
                    set({ isLoading: true, error: null });

                    try {
                        const res = await api.get<ApiResponse<User[]>>(
                            `/user/top-givers?page=${page}&limit=${limit}`
                        );

                        const { data: responseBody } = res;

                        set((state) => ({
                            topGivers:
                                page === 1
                                    ? responseBody.data
                                    : mergeById(state.topGivers, responseBody.data),
                            topGiversMeta: responseBody.meta as any,
                            isLoading: false,
                        }));
                    } catch (err: any) {
                        const msg =
                            err.response?.data?.message || 'Failed to fetch top givers';

                        set({
                            isLoading: false,
                            error: msg,
                        });

                        throw err;
                    }
                },

            }
        }))
    )
);

// Subscribe to changes in the "error" field
useAuthStore.subscribe(
    (state) => state.error,
    (errorValue: any) => {
        if (errorValue) {

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
export const usePublicProfile = () => useAuthStore((state) => state.publicProfile);
export const usePublicProfileLoading = () => useAuthStore((state) => state.publicProfileLoading);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthSessionLoading = () => useAuthStore((state) => state.isSessionLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useAuthActions = () => useAuthStore((state) => state.actions);


export default useAuthStore;
