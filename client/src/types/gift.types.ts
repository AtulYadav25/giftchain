export interface Gift {
    _id: string;
    senderId?: { _id: string; username: string; avatar?: string };
    receiverId?: { _id: string; username: string; avatar?: string };
    senderWallet: string;
    receiverWallet: string;
    amountUSD: number;
    totalTokenAmount: BigInt;
    isMessagePrivate: boolean;
    tokenSymbol: 'sui' | 'sol';
    wrapper: string; // ID or populated
    message?: string;
    status: 'sent' | 'opened' | 'unverified';
    verified: boolean;
    openedAt?: string;
    senderTxHash?: string;
    deliveryTxHash?: string;
    chainID: 'sui' | 'solana';
    isAnonymous?: boolean;
    createdAt: string;
    updatedAt: string;
    username: string;
    avatar: string;
}
