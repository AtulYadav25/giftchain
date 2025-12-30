"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openGift = exports.getGiftById = exports.getReceivedGifts = exports.getSentGifts = exports.createGift = void 0;
const gift_model_1 = require("../models/gift.model");
const createGift = async (senderId, data) => {
    const gift = await gift_model_1.Gift.create({
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
        chainID: data.chainID, // 'sui' | 'solana'
        isAnonymous: data.isAnonymous || false
    });
    return gift;
};
exports.createGift = createGift;
const getSentGifts = async (username, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        gift_model_1.Gift.find({ username })
            .sort({ createdAt: -1 }) // newest first
            .skip(skip)
            .limit(limit),
        gift_model_1.Gift.countDocuments({ username })
    ]);
    return { data, total };
};
exports.getSentGifts = getSentGifts;
const getReceivedGifts = async (username, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        gift_model_1.Gift.find({ username })
            .sort({ createdAt: -1 }) // newest first
            .skip(skip)
            .limit(limit),
        gift_model_1.Gift.countDocuments({ username })
    ]);
    return { data, total };
};
exports.getReceivedGifts = getReceivedGifts;
const getGiftById = async (giftId) => {
    const gift = await gift_model_1.Gift.findById(giftId);
    if (!gift)
        return null;
    if (gift.isAnonymous) {
        // return without populating
        return gift.toObject();
    }
    // populate only if not anonymous
    return gift_model_1.Gift.findById(giftId).populate('senderId', 'username avatar').lean();
};
exports.getGiftById = getGiftById;
const openGift = async (giftId, userId) => {
    const gift = await gift_model_1.Gift.findById(giftId);
    if (!gift)
        throw new Error('Gift not found');
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
exports.openGift = openGift;
