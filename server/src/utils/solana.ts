import { createSolanaRpc, Rpc, SolanaRpcApi } from '@solana/kit';


export type SolClient = {
    rpc: Rpc<SolanaRpcApi>;
};

let networks = {
    mainnet: 'https://api.mainnet-beta.solana.com',
    testnet: 'https://api.testnet.solana.com',
    devnet: 'https://api.devnet.solana.com',
    localnet: 'http://127.0.0.1:8899',
}

let client: SolClient | undefined;
export function createSolanaClient(): SolClient {
    if (!client) {
        client = {
            rpc: createSolanaRpc(networks.testnet),
        };
    }
    return client;
}