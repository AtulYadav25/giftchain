import { Gift } from '../models/gift.model';
import mongoose from 'mongoose';

export const createGift = async (senderId: string, data: any) => {
    const gift = await Gift.create({
        senderId,
        receiverId: data.receiverId,
        receiverWallet: data.receiverWallet,
        wrapperId: data.wrapperId,
        message: data.message,
        status: 'sent',
        chainId: data.chainId,
        // amount: data.amount - Handle payment logic in controller or separate service call
    });
    return gift;
};

export const getSentGifts = async (userId: string) => {
    return Gift.find({ senderId: userId }).populate('wrapperId').populate('receiverId', 'username');
};

export const getReceivedGifts = async (userId: string) => {
    return Gift.find({ receiverId: userId }).populate('wrapperId').populate('senderId', 'username');
};

export const getGiftById = async (giftId: string) => {
    return Gift.findById(giftId).populate('wrapperId').populate('senderId', 'username receiverId');
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
