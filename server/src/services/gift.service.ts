import { Gift } from '../models/gift.model';
import mongoose from 'mongoose';

export const createGift = async (senderId: string, data: any) => {
    const gift = await Gift.create({
        senderId,
        senderWallet: data.senderWallet,
        receiverWallet: data.receiverWallet,

        amountUSD: data.amountUSD, // In USD eg: 100 USD
        totalTokenAmount: data.totalTokenAmount, // In SUI eg: 1.154 SUI
        tokenSymbol: data.tokenSymbol, // 'sui'
        feeUSD: data.feeUSD, // In USD eg: 1 USD
        suiStats: data.suiStats,

        wrapper: data.wrapper,
        message: data.message,

        status: 'unverified',
        verified: false,

        senderTxHash: null,
        deliveryTxHash: null,

        chainID: data.chainID, // 'sui' 
        isAnonymous: false
    });

    return gift;
};

export const verifyGifts = async (giftIds: string[]) => {
    //Get Gift IDs from the Event and update the Mongodb Documents of Gifts to verified true;
    await Gift.updateMany({ _id: { $in: giftIds } }, { isTxConfirmed: true });
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

export const deleteUnverifiedGifts = async (userId: string) => {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    await Gift.deleteMany({ createdAt: { $lt: tenMinutesAgo }, isTxConfirmed: false, senderId: userId });
};