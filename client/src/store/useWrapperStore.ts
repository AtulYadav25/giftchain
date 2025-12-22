import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api, extractData, type ApiResponse } from '../lib/api';
import type { Wrapper } from '../types/WrapperTypes';
import { allWrappers } from '../assets/wrappers/wrapperIndex';

interface WrapperState {
    wrappers: Wrapper[];
    isLoading: boolean;
    error: string | null;
}

interface WrapperActions {
    fetchWrappers: () => Promise<void>;
    uploadWrapper: (file: File) => Promise<void>;
    deleteWrapper: (id: string | number) => Promise<void>;
    getFreeWrappers: () => Wrapper[];
    getPremiumWrappers: () => Wrapper[];
}

const useWrapperStore = create<WrapperState & { actions: WrapperActions }>()(
    devtools((set, get) => ({
        wrappers: [...allWrappers],
        isLoading: false,
        error: null,

        actions: {
            fetchWrappers: async () => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.get<ApiResponse<Wrapper[]>>('/wrappers');
                    const customWrappers = data.data || [];


                    // Merge static and custom wrappers
                    // We'll trust allWrappers as the base and append custom ones
                    // To avoid duplicates if fetch runs multiple times, we reset to allWrappers first
                    // Assuming custom wrappers don't conflict with static IDs (1-5)
                    set({
                        wrappers: [...allWrappers, ...customWrappers],
                        isLoading: false
                    });
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                }
            },

            uploadWrapper: async (file: File) => {
                set({ isLoading: true, error: null });
                try {
                    const formData = new FormData();
                    formData.append('image', file);

                    const { data } = await api.post<ApiResponse<Wrapper>>('/wrappers/upload', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    const newWrapper = data.data;

                    set((state) => ({
                        wrappers: [...state.wrappers, newWrapper],
                        isLoading: false
                    }));
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                    throw err;
                }
            },

            deleteWrapper: async (id: string | number) => {
                set({ isLoading: true, error: null });
                try {
                    await api.delete(`/wrappers/${id}`);

                    set((state) => ({
                        wrappers: state.wrappers.filter(w => w._id !== id),
                        isLoading: false
                    }));
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                    throw err;
                }
            },

            getFreeWrappers: () => {
                return get().wrappers.filter(w => w.priceUSD === 0);
            },

            getPremiumWrappers: () => {
                return get().wrappers.filter(w => w.priceUSD > 0);
            }
        }
    }))
);

export default useWrapperStore;
export const useWrapperActions = () => useWrapperStore((s) => s.actions);
export const useWrappers = () => useWrapperStore((s) => s.wrappers);
export const useWrapperLoading = () => useWrapperStore((s) => s.isLoading);
export const useWrapperError = () => useWrapperStore((s) => s.error);
