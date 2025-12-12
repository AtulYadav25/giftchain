export interface User {
    _id: string;
    username: string;
    avatar?: string;
    address: string;
    referredBy?: string;
    nonce: number;
    totalSentUSD: number;
    totalReceivedUSD: number;
    referralRewardsUSD: number;
    sentCount: number;
    receivedCount: number;
    referralsCount: number;
    createdAt: string;
    updatedAt: string;
}


export interface VerifyRequestData {
    message: number[],
    signature: string,
    nonce: number,
    address: string,
    userId: String,
}


export interface VerifyResponse {
    success: boolean;
    message: string;
    data: User;
    error: string | null;
}