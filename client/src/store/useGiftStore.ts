import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api, extractData, type ApiResponse } from '../lib/api';
import type { Gift } from '../types/gift.types';

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

interface GiftState {
    sentGifts: Gift[];
    receivedGifts: Gift[];
    receivedMeta: PaginationMeta | null;
    sentMeta: PaginationMeta | null;
    currentGift: Gift | null;
    suiStats: {
        suiPrice: number;
        suiHash: string;
    };
    isLoading: boolean;
    error: string | null;
}

export interface SendGiftParams {
    senderWallet: string;
    receiverWallet: string;
    amountUSD: number;
    feeUSD: number;
    totalTokenAmount: number;
    tokenSymbol: 'sui';
    wrapper: string;
    message?: string;
    chainId: 'sui';
    suiStats: {
        suiPrice: number;
        suiHash: string;
    };
    isAnonymous: boolean;
}

export interface VerifyGiftParams {
    giftId: string;
    txDigest: string;
    address: string;
    verifyType: 'wrapGift' | 'claimGift';
}

interface GiftActions {
    sendGift: (giftData: SendGiftParams) => Promise<Gift>;
    verifyGift: (giftData: VerifyGiftParams) => Promise<any>;
    fetchSentGifts: (userName: string, page?: number, limit?: number) => Promise<void>;
    fetchReceivedGifts: (userName: string, page?: number, limit?: number) => Promise<void>;
    fetchGiftById: (id: string) => Promise<void>;
    openGift: (id: string) => Promise<void>;
    getSUIPrice: () => Promise<void>;
}

const useGiftStore = create<GiftState & { actions: GiftActions }>()(
    devtools((set) => ({
        sentGifts: [],
        receivedGifts: [],
        receivedMeta: null,
        sentMeta: null,
        currentGift: null,
        isLoading: false,
        suiStats: {
            suiPrice: null,
            suiHash: null
        },
        error: null,

        actions: {
            sendGift: async (giftData: SendGiftParams) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await api.post<ApiResponse<Gift>>('/gifts/send', giftData);
                    let { data } = extractData(res);
                    set((state) => ({
                        sentGifts: [...state.sentGifts, data],
                        isLoading: false
                    }));
                    return data;
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                    throw err;
                }
            },

            verifyGift: async (giftData: VerifyGiftParams) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await api.post<ApiResponse<Gift>>('/gifts/verify', giftData);
                    let { data } = extractData(res);
                    set((state) => ({
                        receivedGifts: [...state.receivedGifts, data],
                        isLoading: false
                    }));
                    return data;
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                    throw err;
                }
            },

            fetchSentGifts: async (userName: string, page = 1, limit = 10) => {
                set({ isLoading: true, error: null });
                try {
                    // Assuming the API returns { data: Gift[], meta: PaginationMeta } inside the generic response
                    const res = await api.get<ApiResponse<Gift[]>>(`/gifts/sent/${userName}?page=${page}&limit=${limit}`);
                    // The standard extractData returns response.data which typically is the payload.
                    // If the backend returns { success: true, data: [...], meta: {...} }
                    // extractData implementation is: return response.data;
                    // So we get { success, data, meta } ? No, checking api.ts:
                    // interface ApiResponse<T> { success: boolean; message: string; data: T; error?: string; }
                    // extractData returns response.data.
                    // If the API structure is as described in prompt:
                    // { success: true, data: [..], meta: {..} }
                    // Then ApiResponse likely needs to be flexible or we need to access the meta.
                    // The prompt says Response format: { "success": true, "data": [], "meta": {} }
                    // But our ApiResponse type defines data: T.
                    // It seems the "data" field in the JSON response contains the array.
                    // The "meta" field is a sibling of "data".
                    // Let's modify how we access the response to get meta.
                    // Axios returns { data: { success, data, meta } }

                    const { data: responseBody } = res;
                    // @ts-ignore - Assuming response body has meta even if type def might be slightly off or needs update
                    set({
                        sentGifts: responseBody.data,
                        sentMeta: responseBody.meta as any, // Cast or update type def
                        isLoading: false
                    });
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                }
            },

            fetchReceivedGifts: async (address: string, page = 1, limit = 10) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await api.get<ApiResponse<Gift[]>>(`/gifts/received/${address}?page=${page}&limit=${limit}`);
                    const { data: responseBody } = res;
                    set({
                        receivedGifts: responseBody.data,
                        receivedMeta: responseBody.meta as any,
                        isLoading: false
                    });
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                }
            },

            fetchGiftById: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.get<Gift>(`/gift/${id}`);
                    set({ currentGift: data, isLoading: false });
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                }
            },

            openGift: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.post<Gift>(`/gift/open/${id}`);
                    set((state) => ({
                        currentGift: data,
                        receivedGifts: state.receivedGifts.map(g => g._id === id ? data : g),
                        isLoading: false
                    }));
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                    throw err;
                }
            },

            getSUIPrice: async () => {
                set({ isLoading: true, error: null });
                try {
                    const res = await api.get<ApiResponse<{ priceUSD: number, suiHash: string }>>(`/prices/sui`);
                    let { data } = extractData(res);
                    console.log(data)
                    set({
                        suiStats: {
                            suiPrice: data.priceUSD,
                            suiHash: data.suiHash
                        },
                        isLoading: false
                    });
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                    throw err;
                }
            }
        }
    }))
);

export default useGiftStore;
export const useSentGifts = () => useGiftStore((s) => s.sentGifts);
export const useReceivedGifts = () => useGiftStore((s) => s.receivedGifts);
export const useReceivedMeta = () => useGiftStore((s) => s.receivedMeta);
export const useSentMeta = () => useGiftStore((s) => s.sentMeta);
export const useCurrentGift = () => useGiftStore((s) => s.currentGift);
export const useGiftLoading = () => useGiftStore((s) => s.isLoading);
export const useGiftError = () => useGiftStore((s) => s.error);
export const useGiftActions = () => useGiftStore((s) => s.actions);

