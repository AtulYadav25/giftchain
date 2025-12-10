import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;           // referral ID
    avatar?: string;
    address: string;            // wallet address
    referredBy?: string;        // who referred this user
    nonce: Number;

    totalSentUSD: number;       // total $ amount user has sent
    totalReceivedUSD: number;   // total $ amount user has received
    referralRewardsUSD: number; // referral rewards earned

    sentCount: number;          // how many gifts user sent
    receivedCount: number;      // how many gifts user received
    referralsCount: number;     // how many users they referred

    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        username: {
            type: String, // referral ID
            required: true,
            unique: true
        },
        avatar: {
            type: String,
            default: null
        },
        address: {
            type: String,
            required: true,
            unique: true
        },
        referredBy: {
            type: String, // username of referrer
            default: null
        },
        nonce: {
            type: Number,
            required: true,
        },

        // --- Giftchain Stats ---
        totalSentUSD: {
            type: Number,
            default: 0
        },
        totalReceivedUSD: {
            type: Number,
            default: 0
        },
        referralRewardsUSD: {
            type: Number,
            default: 0
        },

        // --- Counts ---
        sentCount: {
            type: Number,
            default: 0
        },
        receivedCount: {
            type: Number,
            default: 0
        },
        referralsCount: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
