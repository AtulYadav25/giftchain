import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { config } from '../config/env';

export type Network = 'mainnet' | 'testnet' | 'devnet' | 'localnet';

const sui_network = config.SUI_NETWORK === 'testnet' ? 'testnet' : 'mainnet';

/** Get the client for the specified network. */
export const getClient = () => {
    return new SuiClient({ url: getFullnodeUrl(sui_network) });
}; 