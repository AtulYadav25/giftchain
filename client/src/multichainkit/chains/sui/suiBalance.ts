
import { SuiClient } from '@mysten/sui/client';

const MIST_PER_SUI = 1_000_000_000;

export const getSuiBalance = async (client: SuiClient, address: string): Promise<string> => {
    try {
        const balance = await client.getBalance({
            owner: address,
        });

        const amount = Number(balance.totalBalance) || 0;
        return (amount / MIST_PER_SUI).toFixed(4);
    } catch (e) {
        console.error("Failed to get Sui balance", e);
        return "0.00";
    }
};
