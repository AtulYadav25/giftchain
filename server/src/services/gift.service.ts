import { Gift } from '../models/gift.model';
import mongoose from 'mongoose';
import { User } from '../models/user.model';

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


export const getSentGifts = async (
    address: string,
    page = 1,
    limit = 10
) => {
    const skip = (page - 1) * limit;

    const data = await Gift.aggregate([
        // 1️⃣ Match sender wallet
        {
            $match: {
                senderWallet: address
            }
        },

        // 2️⃣ Sort
        {
            $sort: { createdAt: -1 }
        },

        // 3️⃣ Pagination
        { $skip: skip },
        { $limit: limit },

        // 4️⃣ Lookup user by wallet
        {
            $lookup: {
                from: 'users',
                localField: 'receiverWallet',
                foreignField: 'address',
                as: 'user'
            }
        },

        // 5️⃣ Flatten user array
        {
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true
            }
        },

        // 6️⃣ Final projection (FLAT structure)
        {
            $project: {
                _id: 1,

                senderWallet: 1,
                receiverWallet: 1,

                amountUSD: 1,
                feeUSD: 1,
                totalTokenAmount: 1,
                tokenSymbol: 1,

                suiStats: {
                    suiPrice: 1,
                    suiHash: 1
                },

                wrapper: 1,
                message: 1,

                status: 1,
                isTxConfirmed: 1,
                openedAt: 1,

                // 🔥 flattened user fields
                username: '$user.username',
                avatar: '$user.avatar',

                createdAt: 1
            }
        }
    ]);

    const total = await Gift.countDocuments({ senderWallet: address });

    return { data, total };
};



export const getReceivedGifts = async (address: string, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const data = await Gift.aggregate([
        // 1️⃣ Match sender wallet
        {
            $match: {
                senderWallet: address
            }
        },

        // 2️⃣ Sort
        {
            $sort: { createdAt: -1 }
        },

        // 3️⃣ Pagination
        { $skip: skip },
        { $limit: limit },

        // 4️⃣ Lookup user by wallet
        {
            $lookup: {
                from: 'users',
                localField: 'senderWallet',
                foreignField: 'address',
                as: 'user'
            }
        },

        // 5️⃣ Flatten user array
        {
            $unwind: {
                path: '$user',
                preserveNullAndEmptyArrays: true
            }
        },

        // 6️⃣ Final projection (FLAT structure)
        {
            $project: {
                _id: 1,

                senderWallet: 1,
                receiverWallet: 1,

                amountUSD: 1,
                feeUSD: 1,
                totalTokenAmount: 1,
                tokenSymbol: 1,

                suiStats: {
                    suiPrice: 1,
                    suiHash: 1
                },

                wrapper: 1,
                message: 1,

                status: 1,
                isTxConfirmed: 1,
                openedAt: 1,

                // 🔥 flattened user fields
                username: '$user.username',
                avatar: '$user.avatar',

                createdAt: 1
            }
        }
    ]);

    const total = await Gift.countDocuments({ receiverWallet: address });

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

export const resolveRecipients = async (usernames: string[]) => {
    // 1️⃣ Fetch all matching users
    const users = await User.find({
        username: { $in: usernames }
    }).select("username");

    // 2️⃣ Map for fast lookup
    const userMap = new Map(
        users.map(user => [user.username, user])
    );

    // 3️⃣ Detect missing usernames WITH POSITION
    const invalidUsernames: { username: string; index: number }[] = [];

    usernames.forEach((username, index) => {
        if (!userMap.has(username)) {
            invalidUsernames.push({ username, index });
        }
    });

    // 4️⃣ Throw error if any invalid
    if (invalidUsernames.length > 0) {
        const message = invalidUsernames
            .map(
                u => `Invalid username "${u.username}" at position ${u.index + 1}`
            )
            .join(", ");

        throw new Error(message);
    }

    // 5️⃣ Return users IN SAME ORDER as input
    return usernames.map(username => userMap.get(username)!);
};
