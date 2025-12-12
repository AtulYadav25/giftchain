export interface Gift {
    _id: string;
    senderId?: string | { _id: string; username: string; avatar?: string };
    receiverId?: string | { _id: string; username: string; avatar?: string };
    senderWallet: string;
    receiverWallet: string;
    amountUSD: number;
    tokenAmount: number;
    tokenSymbol: 'sui' | 'sol';
    wrapper: string; // ID or populated
    message?: string;
    status: 'sent' | 'opened';
    verified: boolean;
    openedAt?: string;
    senderTxHash?: string;
    deliveryTxHash?: string;
    chainID: 'sui' | 'solana';
    isAnonymous?: boolean;
    createdAt: string;
    updatedAt: string;
}
