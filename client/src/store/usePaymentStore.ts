import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { api } from '../lib/api';
import type { SuiBalanceResponse, SolBalanceResponse } from '../types/payment.types';

interface PaymentState {
    suiBalance: number;
    solBalance: number;
    isLoading: boolean;
    error: string | null;
}

interface PaymentActions {
    sendSui: (recipient: string, amount: number) => Promise<any>;
    fetchSuiBalance: (address: string) => Promise<void>;
    sendSol: (recipient: string, amount: number) => Promise<any>;
    fetchSolBalance: (address: string) => Promise<void>;
}

const usePaymentStore = create<PaymentState & { actions: PaymentActions }>()(
    devtools((set) => ({
        suiBalance: 0,
        solBalance: 0,
        isLoading: false,
        error: null,

        actions: {
            sendSui: async (recipient, amount) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.post('/payment/sui/send', { recipient, amount });
                    set({ isLoading: false });
                    return data;
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                    throw err;
                }
            },

            fetchSuiBalance: async (address) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.get<SuiBalanceResponse>('/payment/sui/balance', { params: { address } });
                    set({ suiBalance: data.totalBalance, isLoading: false });
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                }
            },

            sendSol: async (recipient, amount) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.post('/payment/sol/send', { recipient, amount });
                    set({ isLoading: false });
                    return data;
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                    throw err;
                }
            },

            fetchSolBalance: async (address) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.get<SolBalanceResponse>('/payment/sol/balance', { params: { address } });
                    set({ solBalance: data.balance, isLoading: false });
                } catch (err: any) {
                    set({ isLoading: false, error: err.message });
                }
            }
        }
    }))
);

export const useSuiBalance = () => usePaymentStore((s) => s.suiBalance);
export const useSolBalance = () => usePaymentStore((s) => s.solBalance);
export const usePaymentLoading = () => usePaymentStore((s) => s.isLoading);
export const usePaymentError = () => usePaymentStore((s) => s.error);
export const usePaymentActions = () => usePaymentStore((s) => s.actions);
