import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api, extractData, type ApiResponse } from '../lib/api';
import type { Gift } from '../types/gift.types';
import toast from 'react-hot-toast';

//TODO : The specific loadings declared here are aren't used in the components, 
// I have two choice either remove the loadings from here or replace with the components loading

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
    publicUserSentGifts: Gift[];
    publicUserReceivedGifts: Gift[];
    publicUserReceivedMeta: PaginationMeta | null;
    publicUserSentMeta: PaginationMeta | null;
    currentGift: Gift | null;
    tokenStats: {
        tokenPrice: number;
        tokenHash: string;
    };
    globalGiftStats: {
        totalAmountUSD: number;
        totalGiftsSent: number;
    };
    // Loading States
    giftTxLoadingStates: number;
    isSentGiftsLoading: boolean;
    isReceivedGiftsLoading: boolean;
    isFetchingGift: boolean;
    isClaimingGift: boolean;
    isResolvingRecipients: boolean;
    isTokenPriceLoading: boolean;
    isGlobalStatsLoading: boolean;
    isDeletingGift: boolean;
    isOpeningGift: boolean;

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
    setGiftTxLoadingStates: (state: number) => void;
    sendGift: (giftData: SendGiftParams) => Promise<Gift>;
    verifyGift: (giftData: VerifyGiftParams) => Promise<any>;
    deleteUnVerifiedGift: (giftId: string) => Promise<void>;
    fetchSentGifts: (userName: string, page?: number, limit?: number) => Promise<void>;
    fetchMySentGifts: (page?: number, limit?: number) => Promise<void>;
    fetchReceivedGifts: (userName: string, page?: number, limit?: number) => Promise<void>;
    fetchMyReceivedGifts: (address: string, page?: number, limit?: number) => Promise<void>;
    fetchGiftById: (id: string) => Promise<void>;
    openGift: (id: string) => Promise<void>;
    getSUIPrice: () => Promise<void>;
    getSOLPrice: () => Promise<void>;
    resolveRecipients: (usernames: string[]) => Promise<{ resolved: [{ username: string, address: string }], invalidUsernames: [{ username: string, address: string }] }>;
    claimGiftSubmit: (giftId: string) => Promise<{ txDigest: string }>;
    getGlobalGiftStats: () => Promise<{ totalAmountUSD: number, totalGiftsSent: number }>;
    emptyGiftStats: () => void;
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
        publicUserSentGifts: [],
        publicUserReceivedGifts: [],
        publicUserReceivedMeta: null,
        publicUserSentMeta: null,
        receivedMeta: null,
        sentMeta: null,
        currentGift: null,
        globalGiftStats: {
            totalAmountUSD: 0,
            totalGiftsSent: 0,
        },
        giftTxLoadingStates: 0,
        tokenStats: {
            tokenPrice: null,
            tokenHash: null
        },

        // Initial Loading States
        isSentGiftsLoading: false,
        isReceivedGiftsLoading: false,
        isFetchingGift: false,
        isClaimingGift: false,
        isResolvingRecipients: false,
        isTokenPriceLoading: false,
        isGlobalStatsLoading: false,
        isDeletingGift: false,
        isOpeningGift: false,

        error: null,

        actions: {
            setGiftTxLoadingStates: (state: number) =>
                set((prev) => ({
                    ...prev,
                    giftTxLoadingStates: state,
                })),

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
                set({ isDeletingGift: true, error: null });
                try {
                    await api.get<ApiResponse<any>>(`/gifts/delete-unverified/${giftId}`);

                    toast.success("Gift Deleted!");
                    set({ isDeletingGift: false });

                    return;
                } catch (err: any) {
                    set({ isDeletingGift: false, error: err.message });
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



            fetchSentGifts: async (address: string, page = 1, limit = 10) => {
                set({ isSentGiftsLoading: true, error: null });

                try {
                    const res = await api.get<ApiResponse<Gift[]>>(
                        `/gifts/sent/${address}?page=${page}&limit=${limit}`
                    );

                    const { data: responseBody } = res;

                    //TODO : Maybe here i dont need to validate if its user address and i can directly proceed setting the data to publicUserSent

                    set((state) => ({
                        publicUserSentGifts:
                            page === 1
                                ? responseBody.data
                                : mergeById(state.publicUserSentGifts, responseBody.data),

                        publicUserSentMeta:
                            page === 1
                                ? responseBody.meta
                                : state.publicUserSentMeta,

                        isSentGiftsLoading: false,
                    }));



                } catch (err: any) {
                    set({
                        isSentGiftsLoading: false,
                        error:
                            err?.response?.data?.message ||
                            err?.message ||
                            'Failed to fetch sent gifts'
                    });
                }
            },


            fetchMySentGifts: async (page = 1, limit = 10) => {
                set({ isSentGiftsLoading: true, error: null });

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
                        isSentGiftsLoading: false,

                    }));
                } catch (err: any) {
                    set({ isSentGiftsLoading: false, error: err.message });
                }
            },


            fetchReceivedGifts: async (address: string, page = 1, limit = 10) => {
                set({ isReceivedGiftsLoading: true, error: null });

                try {
                    const res = await api.get<ApiResponse<Gift[]>>(
                        `/gifts/received/${address}?page=${page}&limit=${limit}`
                    );

                    const { data: responseBody } = res;


                    set((state) => ({
                        publicUserReceivedGifts:
                            page === 1
                                ? responseBody.data
                                : mergeById(state.publicUserReceivedGifts, responseBody.data),
                        publicUserReceivedMeta: responseBody.meta as any,
                        isReceivedGiftsLoading: false,
                    }));


                } catch (err: any) {
                    set({ isReceivedGiftsLoading: false, error: err.message });
                }
            },

            fetchMyReceivedGifts: async (address: string, page = 1, limit = 10) => {
                set({ isReceivedGiftsLoading: true, error: null });

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
                        isReceivedGiftsLoading: false,
                    }));


                } catch (err: any) {
                    set({ isReceivedGiftsLoading: false, error: err.message });
                }
            },


            fetchGiftById: async (id: string) => {
                set({ isFetchingGift: true, error: null });
                try {
                    const { data } = await api.get<Gift>(`/gift/${id}`);
                    set({ currentGift: data, isFetchingGift: false });
                } catch (err: any) {
                    set({ isFetchingGift: false, error: err.message });
                }
            },

            openGift: async (id: string) => {
                set({ isOpeningGift: true, error: null });
                try {
                    const { data } = await api.post<Gift>(`/gift/open/${id}`);
                    set((state) => ({
                        currentGift: data,
                        receivedGifts: state.receivedGifts.map(g => g._id === id ? data : g),
                        isOpeningGift: false
                    }));
                } catch (err: any) {
                    set({ isOpeningGift: false, error: err.message });
                    // throw err;
                }
            },

            getSUIPrice: async () => {
                set({ isTokenPriceLoading: true, error: null });
                try {
                    const res = await api.get<ApiResponse<{ priceUSD: number, tokenHash: string }>>(`/prices/sui`);
                    let { data } = extractData(res);
                    set({
                        tokenStats: {
                            tokenPrice: data.priceUSD,
                            tokenHash: data.tokenHash
                        },
                        isTokenPriceLoading: false
                    });
                } catch (err: any) {
                    set({ isTokenPriceLoading: false, error: err.message });
                    // throw err;
                }
            },

            getSOLPrice: async () => {
                set({ isTokenPriceLoading: true, error: null });
                try {
                    const res = await api.get<ApiResponse<{ priceUSD: number, tokenHash: string }>>(`/prices/sol`);
                    let { data } = extractData(res);
                    set({
                        tokenStats: {
                            tokenPrice: data.priceUSD,
                            tokenHash: data.tokenHash
                        },
                        isTokenPriceLoading: false
                    });
                } catch (err: any) {
                    set({ isTokenPriceLoading: false, error: err.message });
                    // throw err;
                }
            },

            claimGiftSubmit: async (giftId: string) => {
                set({ isClaimingGift: true, error: null });
                try {
                    const res = await api.get<ApiResponse<{ txDigest: string }>>(`/gifts/claim-gift/${giftId}`);
                    let { data } = extractData(res);

                    // Update the local gift state to opened
                    set((state) => ({
                        receivedGifts: state.receivedGifts.map(g => g._id === giftId ? { ...g, status: 'opened' } : g),
                        currentGift: state.currentGift?._id === giftId ? { ...state.currentGift, status: 'opened', claimTransactionId: data.txDigest } : state.currentGift,
                        isClaimingGift: false
                    }));

                    return data;
                } catch (err: any) {
                    set({ isClaimingGift: false, error: err.message });
                    // throw err;
                }
            },

            resolveRecipients: async (usernames: string[]) => {
                set({ isResolvingRecipients: true, error: null });
                try {
                    const res = await api.post<ApiResponse<{}>>(`/gifts/recipients/resolve`, { usernames });
                    let { data, success } = extractData(res);

                    set({ isResolvingRecipients: false });

                    if (success === true) {
                        return data;
                    } else {
                        return data;
                    }
                } catch (err: any) {
                    toast.error(err.message)
                    set({ isResolvingRecipients: false, error: err.message });
                    // throw err;
                }
            },

            getGlobalGiftStats: async () => {
                set({ isGlobalStatsLoading: true, error: null });
                try {
                    const res = await api.get<ApiResponse<{ totalAmountUSD: number, totalGiftsSent: number }>>(`/gifts/stats`);
                    let { data } = extractData(res);

                    set({
                        globalGiftStats: {
                            totalAmountUSD: data.totalAmountUSD,
                            totalGiftsSent: data.totalGiftsSent,
                        },
                        isGlobalStatsLoading: false
                    });

                    return data;
                } catch (err: any) {
                    set({ isGlobalStatsLoading: false, error: err.message });
                    // throw err;
                }
            },

            emptyGiftStats: () => {
                set({
                    sentGifts: [],
                    receivedGifts: [],
                    publicUserSentGifts: [],
                    publicUserReceivedGifts: [],
                    publicUserReceivedMeta: null,
                    publicUserSentMeta: null,
                    receivedMeta: null,
                    sentMeta: null,
                    currentGift: null,
                    giftTxLoadingStates: 0,
                });
            },

        }
    }))
);

export default useGiftStore;
export const useSentGifts = () => useGiftStore((s) => s.sentGifts);
export const useReceivedGifts = () => useGiftStore((s) => s.receivedGifts);
export const useReceivedMeta = () => useGiftStore((s) => s.receivedMeta);
export const useSentMeta = () => useGiftStore((s) => s.sentMeta);

export const usePublicUserSentGifts = () => useGiftStore((s) => s.publicUserSentGifts);
export const usePublicUserReceivedGifts = () => useGiftStore((s) => s.publicUserReceivedGifts);
export const usePublicUserReceivedMeta = () => useGiftStore((s) => s.publicUserReceivedMeta);
export const usePublicUserSentMeta = () => useGiftStore((s) => s.publicUserSentMeta);


export const useCurrentGift = () => useGiftStore((s) => s.currentGift);
export const useGiftTxLoadingStates = () => useGiftStore((s) => s.giftTxLoadingStates);
export const useGiftError = () => useGiftStore((s) => s.error);
export const useGiftActions = () => useGiftStore((s) => s.actions);

// Specific Loading Selectors
export const useSentGiftsLoading = () => useGiftStore((s) => s.isSentGiftsLoading);
export const useReceivedGiftsLoading = () => useGiftStore((s) => s.isReceivedGiftsLoading);
export const useFetchingGiftLoading = () => useGiftStore((s) => s.isFetchingGift);
export const useClaimingGiftLoading = () => useGiftStore((s) => s.isClaimingGift);
export const useResolvingRecipientsLoading = () => useGiftStore((s) => s.isResolvingRecipients);
export const useTokenPriceLoading = () => useGiftStore((s) => s.isTokenPriceLoading);
export const useGlobalStatsLoading = () => useGiftStore((s) => s.isGlobalStatsLoading);
export const useDeletingGift = () => useGiftStore((s) => s.isDeletingGift);

// Legacy/Composite Loading Selector
export const useGiftLoading = () => useGiftStore((s) =>
    s.isSentGiftsLoading ||
    s.isReceivedGiftsLoading ||
    s.isFetchingGift ||
    s.isClaimingGift ||
    s.isResolvingRecipients ||
    s.isTokenPriceLoading ||
    s.isDeletingGift ||
    s.isOpeningGift
);

