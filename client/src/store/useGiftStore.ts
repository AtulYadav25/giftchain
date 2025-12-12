import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../lib/api';
import type { Gift } from '../types/gift.types';

interface GiftState {
    sentGifts: Gift[];
    receivedGifts: Gift[];
    currentGift: Gift | null;
    isLoading: boolean;
    error: string | null;
}

export interface SendGiftParams {
    senderWallet: string;
    receiverWallet: string;
    amountUSD: number;
    tokenAmount: number;
    tokenSymbol: 'sui' | 'sol';
    wrapper: string;
    message?: string;
    senderTxHash?: string;
    chainID: 'sui' | 'solana';
    isAnonymous?: boolean;
}

interface GiftActions {
    sendGift: (giftData: SendGiftParams) => Promise<Gift>;
    fetchSentGifts: () => Promise<void>;
    fetchReceivedGifts: () => Promise<void>;
    fetchGiftById: (id: string) => Promise<void>;
    openGift: (id: string) => Promise<void>;
}

const useGiftStore = create<GiftState & { actions: GiftActions }>()(
    devtools((set) => ({
        sentGifts: [],
        receivedGifts: [],
        currentGift: null,
        isLoading: false,
        error: null,

        actions: {
            sendGift: async (giftData: SendGiftParams) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.post<Gift>('/gift/send', giftData);
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

            fetchSentGifts: async () => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.get<Gift[]>('/gift/sent');
                    set({ sentGifts: data, isLoading: false });
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                }
            },

            fetchReceivedGifts: async () => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.get<Gift[]>('/gift/received');
                    set({ receivedGifts: data, isLoading: false });
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
            }
        }
    }))
);

export const useSentGifts = () => useGiftStore((s) => s.sentGifts);
export const useReceivedGifts = () => useGiftStore((s) => s.receivedGifts);
export const useCurrentGift = () => useGiftStore((s) => s.currentGift);
export const useGiftLoading = () => useGiftStore((s) => s.isLoading);
export const useGiftError = () => useGiftStore((s) => s.error);
export const useGiftActions = () => useGiftStore((s) => s.actions);
