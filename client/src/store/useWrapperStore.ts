import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../lib/api';
import type { Wrapper } from '../types/wrapper.types';

interface WrapperState {
    wrappers: Wrapper[];
    currentWrapper: Wrapper | null;
    isLoading: boolean;
    error: string | null;
}

interface WrapperActions {
    fetchAllWrappers: () => Promise<void>;
    fetchWrapperById: (id: string) => Promise<void>;
    uploadWrapper: (formData: FormData) => Promise<Wrapper>;
}

const useWrapperStore = create<WrapperState & { actions: WrapperActions }>()(
    devtools((set) => ({
        wrappers: [],
        currentWrapper: null,
        isLoading: false,
        error: null,

        actions: {
            fetchAllWrappers: async () => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.get<Wrapper[]>('/wrapper');
                    set({ wrappers: data, isLoading: false });
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                }
            },

            fetchWrapperById: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.get<Wrapper>(`/wrapper/${id}`);
                    set({ currentWrapper: data, isLoading: false });
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                }
            },

            uploadWrapper: async (formData: FormData) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.post<Wrapper>('/wrapper/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    set((state) => ({ wrappers: [...state.wrappers, data], isLoading: false }));
                    return data;
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                    throw err;
                }
            }
        }
    }))
);

export const useWrappers = () => useWrapperStore((s) => s.wrappers);
export const useWrapper = () => useWrapperStore((s) => s.currentWrapper);
export const useWrapperLoading = () => useWrapperStore((s) => s.isLoading);
export const useWrapperError = () => useWrapperStore((s) => s.error);
export const useWrapperActions = () => useWrapperStore((s) => s.actions);
