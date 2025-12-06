import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui/transactions';
import { config } from '../config/env';

// Initialize SUI Client
const client = new SuiClient({ url: getFullnodeUrl('devnet') });

// Load Server Keypair
let keypair: Ed25519Keypair;
if (config.SUI_PRIVATE_KEY) {
    // Assuming SUI_PRIVATE_KEY is a base64 string or similar
    try {
        keypair = Ed25519Keypair.fromSecretKey(config.SUI_PRIVATE_KEY);
    } catch (e) {
        console.warn('Sui Private Key invalid or not set properly.');
    }
}

export const getBalance = async (address: string) => {
    const balance = await client.getBalance({ owner: address });
    return balance;
};

export const sendSui = async (recipient: string, amount: number) => {
    if (!keypair) throw new Error('Server SUI wallet not configured');

    const tx = new TransactionBlock();
    const [coin] = tx.splitCoins(tx.gas, [amount]);
    tx.transferObjects([coin], recipient);

    const result = await client.signAndExecuteTransactionBlock({
        signer: keypair,
        transactionBlock: tx,
    });

    return result;
};
