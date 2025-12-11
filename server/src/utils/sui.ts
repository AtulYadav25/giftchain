import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

export type Network = 'mainnet' | 'testnet' | 'devnet' | 'localnet';

/** Get the client for the specified network. */
export const getClient = (network: Network) => {
    return new SuiClient({ url: getFullnodeUrl(network) });
}; 