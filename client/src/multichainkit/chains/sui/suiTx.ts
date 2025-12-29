
import { Transaction } from '@mysten/sui/transactions';

export const createSuiTransferTx = (transfers: { amount: number; address: string }[]) => {
    const tx = new Transaction();
    const MIST_PER_SUI = 1_000_000_000;

    transfers.forEach(({ amount, address }) => {
        // Handle float to int conversion safely, though simple multiplication is okay for this demo
        const amountMist = BigInt(Math.floor(amount * MIST_PER_SUI));

        // Split coins from Gas
        // Note: splitCoins return type is a Result (coin), which we can use in transferObjects
        const [coin] = tx.splitCoins(tx.gas, [amountMist]);

        tx.transferObjects([coin], address);
    });

    return tx;
};
