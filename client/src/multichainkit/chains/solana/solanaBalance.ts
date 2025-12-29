
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const getSolanaBalance = async (connection: Connection, address: string): Promise<string> => {
    try {
        const publicKey = new PublicKey(address);
        const balance = await connection.getBalance(publicKey);
        return (balance / LAMPORTS_PER_SOL).toFixed(4);
    } catch (e) {
        return "0.00";
    }
};
