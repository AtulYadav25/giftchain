import { Gift } from '../models/gift.model';
import mongoose from 'mongoose';

export const createGift = async (senderId: string, data: any) => {
    const gift = await Gift.create({
        senderId,
        senderWallet: data.senderWallet,
        receiverWallet: data.receiverWallet,

        amountUSD: data.amountUSD,
        tokenAmount: data.tokenAmount,
        tokenSymbol: data.tokenSymbol, // 'sui' | 'sol'

        wrapper: data.wrapper,
        message: data.message,

        status: 'sent',

        senderTxHash: data.senderTxHash || null,
        deliveryTxHash: data.deliveryTxHash || null,

        chainID: data.chainID, // 'sui' | 'solana'
        isAnonymous: data.isAnonymous || false
    });

    return gift;
};


export const getSentGifts = async (username: string, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        Gift.find({ username })
            .sort({ createdAt: -1 }) // newest first
            .skip(skip)
            .limit(limit),

        Gift.countDocuments({ username })
    ]);

    return { data, total };
};


export const getReceivedGifts = async (username: string, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        Gift.find({ username })
            .sort({ createdAt: -1 }) // newest first
            .skip(skip)
            .limit(limit),

        Gift.countDocuments({ username })
    ]);

    return { data, total };
};

export const getGiftById = async (giftId: string) => {
    const gift = await Gift.findById(giftId);

    if (!gift) return null;

    if (gift.isAnonymous) {
        // return without populating
        return gift.toObject();
    }

    // populate only if not anonymous
    return Gift.findById(giftId).populate('senderId', 'username avatar').lean();
};

export const openGift = async (giftId: string, userId: string) => {
    const gift = await Gift.findById(giftId);
    if (!gift) throw new Error('Gift not found');

    // Security check: only receiver can open? Or anyone with link?
    // Assuming strict receiver check if receiverId is set
    if (gift.receiverId && gift.receiverId.toString() !== userId) {
        throw new Error('Not authorized to open this gift');
    }

    gift.status = 'opened';
    gift.openedAt = new Date();
    await gift.save();
    return gift;
};
