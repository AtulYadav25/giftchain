import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api, extractData, type ApiResponse } from '../lib/api';
import type { Gift } from '../types/gift.types';
import toast from 'react-hot-toast';

export interface PaginationMeta {
    total: number | null;
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
    tokenStats: {
        tokenPrice: number;
        tokenHash: string;
    };
    giftTxLoadingStates: number;
    isLoading: boolean;
    error: string | null;
}

export interface SendGiftParams {
    senderWallet: string;
    receiverWallet: string;
    amountUSD: number;
    feeUSD: number;
    totalTokenAmount: string;
    tokenSymbol: 'sui' | 'sol';
    wrapper: string;
    message?: string;
    chain: 'sui' | 'sol';
    mediaType: 'image';
    tokenStats: {
        tokenPrice: number;
        tokenHash: string;
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
    fetchMySentGifts: (page?: number, limit?: number) => Promise<void>;
    fetchReceivedGifts: (userName: string, page?: number, limit?: number) => Promise<void>;
    fetchGiftById: (id: string) => Promise<void>;
    openGift: (id: string) => Promise<void>;
    getSUIPrice: () => Promise<void>;
    getSOLPrice: () => Promise<void>;
    resolveRecipients: (usernames: string[]) => Promise<[{ username: string, address: string }]>;
    claimGiftIntent: (giftId: string) => Promise<{ txBytes: Base64URLString }>;
    claimGiftSubmit: (giftId: string) => Promise<{ txDigest: string }>;
}

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

//TODO : Same API Endpoint can be do both the work of fetchSentGifts and fetchMySentGifts, Update 
// API Endpoint to check if user is authenticated, if yes then proceed with fetchMySentGifts else
// fetchSentGifts
const useGiftStore = create<GiftState & { actions: GiftActions }>()(
    devtools((set) => ({
        sentGifts: [],
        receivedGifts: [],
        receivedMeta: null,
        sentMeta: null,
        currentGift: null,
        isLoading: false,
        giftTxLoadingStates: 0,
        tokenStats: {
            tokenPrice: null,
            tokenHash: null
        },
        error: null,

        actions: {
            sendGift: async (giftData: SendGiftParams) => {
                set({ giftTxLoadingStates: 1, error: null });
                try {
                    const res = await api.post<ApiResponse<Gift>>('/gifts/send', giftData);
                    let { data } = extractData(res);
                    set((state) => ({
                        sentGifts: [...state.sentGifts, data],
                        giftTxLoadingStates: 2
                    }));
                    return data;
                } catch (err: any) {
                    set({ giftTxLoadingStates: 0, error: err.message });
                    throw err;
                }
            },

            deleteUnVerifiedGift: async (giftId: string) => {
                try {
                    await api.get<ApiResponse<any>>(`/gifts/delete-unverified/${giftId}`);

                    toast.success("Gift Deleted!");

                    return;
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                    throw err;
                }
            },

            verifyGift: async (giftData: VerifyGiftParams) => {
                set({ giftTxLoadingStates: 3, error: null });
                try {
                    const res = await api.post<ApiResponse<Gift>>('/gifts/verify', giftData);
                    let { data } = extractData(res);
                    set({ giftTxLoadingStates: 0 });
                    return data;
                } catch (err: any) {
                    set({ giftTxLoadingStates: 0, error: err.message });
                    throw err;
                }
            },



            fetchSentGifts: async (userName: string, page = 1, limit = 10) => {
                set({ isLoading: true, error: null });

                try {
                    const res = await api.get<ApiResponse<Gift[]>>(
                        `/gifts/sent/${userName}?page=${page}&limit=${limit}`
                    );

                    const { data: responseBody } = res;

                    set((state) => ({
                        sentGifts:
                            page === 1
                                ? responseBody.data // FULL REFRESH (latest gifts)
                                : mergeById(state.sentGifts, responseBody.data),
                        sentMeta: responseBody.meta as any,
                        isLoading: false
                    }));
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                }
            },

            fetchMySentGifts: async (page = 1, limit = 10) => {
                set({ isLoading: true, error: null });

                try {
                    const res = await api.get<ApiResponse<Gift[]>>(
                        `/gifts/me/sent?page=${page}&limit=${limit}`
                    );

                    const { data: responseBody } = res;

                    set((state) => ({
                        sentGifts:
                            page === 1
                                ? responseBody.data // FULL REFRESH (latest gifts)
                                : mergeById(state.sentGifts, responseBody.data),
                        sentMeta: responseBody.meta as any,
                        isLoading: false
                    }));
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                }
            },


            fetchReceivedGifts: async (address: string, page = 1, limit = 10) => {
                set({ isLoading: true, error: null });

                try {
                    const res = await api.get<ApiResponse<Gift[]>>(
                        `/gifts/received/${address}?page=${page}&limit=${limit}`
                    );

                    const { data: responseBody } = res;

                    set((state) => ({
                        receivedGifts:
                            page === 1
                                ? responseBody.data
                                : mergeById(state.receivedGifts, responseBody.data),
                        receivedMeta: responseBody.meta as any,
                        isLoading: false
                    }));
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
                    const res = await api.get<ApiResponse<{ priceUSD: number, tokenHash: string }>>(`/prices/sui`);
                    let { data } = extractData(res);
                    set({
                        tokenStats: {
                            tokenPrice: data.priceUSD,
                            tokenHash: data.tokenHash
                        },
                        isLoading: false
                    });
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                    throw err;
                }
            },

            getSOLPrice: async () => {
                set({ isLoading: true, error: null });
                try {
                    const res = await api.get<ApiResponse<{ priceUSD: number, tokenHash: string }>>(`/prices/sol`);
                    let { data } = extractData(res);
                    set({
                        tokenStats: {
                            tokenPrice: data.priceUSD,
                            tokenHash: data.tokenHash
                        },
                        isLoading: false
                    });
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                    throw err;
                }
            },

            claimGiftIntent: async (giftId: string) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await api.post<ApiResponse<{ txBytes: Base64URLString }>>(`/gifts/claim-intent/${giftId}`);
                    let { data } = extractData(res);

                    // Don't set loading to false here, as we continue to signing
                    return data;
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                    throw err;
                }
            },

            claimGiftSubmit: async (giftId: string) => {
                // Loading should already be true from intent/signing
                try {
                    const res = await api.get<ApiResponse<{ txDigest: string }>>(`/gifts/claim-gift/${giftId}`);
                    let { data } = extractData(res);

                    // Update the local gift state to opened
                    set((state) => ({
                        receivedGifts: state.receivedGifts.map(g => g._id === giftId ? { ...g, status: 'opened' } : g),
                        currentGift: state.currentGift?._id === giftId ? { ...state.currentGift, status: 'opened', claimTransactionId: data.txDigest } : state.currentGift,
                        isLoading: false
                    }));

                    return data;
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                    throw err;
                }
            },

            resolveRecipients: async (usernames: string[]) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await api.post<ApiResponse<{}>>(`/gifts/recipients/resolve`, { usernames });
                    let { data, success } = extractData(res);

                    if (success === true) {
                        return data;
                    } else {
                        return data;
                    }
                } catch (err: any) {
                    toast.error(err.message)
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

