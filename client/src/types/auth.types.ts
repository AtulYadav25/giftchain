export interface User {
    _id: string;
    username: string;
    avatar?: string;
    banner?: string;
    address: string;
    chain?: 'sol' | 'sui';
    nonce?: number;
    bio?: string[];
    totalSentUSD: number;
    totalReceivedUSD: number;
    settings?: { show_gift_sent: boolean };
    sentCount: number;
    receivedCount: number;
    createdAt: string;
    updatedAt: string;
    socials?: { platform: string; link: string }[];
    alternateAddresses?: { chain: 'sol' | 'sui', address: string }[];
}


export interface VerifyRequestData {
    message: number[],
    signature: string,
    nonce: number,
    address: string,
    userId: String,
    chain: 'sol' | 'sui'
}


export interface VerifyResponse {
    success: boolean;
    message: string;
    data: User;
    error: string | null;
}