import { createSolanaRpc, Rpc, SolanaRpcApi } from '@solana/kit';
import { config } from '../config/env';


export type SolClient = {
    rpc: Rpc<SolanaRpcApi>;
};

let networks = {
    mainnet: 'https://api.mainnet-beta.solana.com',
    testnet: 'https://api.testnet.solana.com',
    devnet: 'https://api.devnet.solana.com',
    localnet: 'http://127.0.0.1:8899',
}

const solana_network = config.SOLANA_NETWORK;

let client: SolClient | undefined;
export function createSolanaClient(): SolClient {
    if (!client) {
        client = {
            rpc: createSolanaRpc(solana_network === 'testnet' ? networks.testnet : networks.mainnet),
        };
    }
    return client;
}