import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username: string;           // referral ID
    avatar?: string;
    address: string;            // wallet address
    chain: 'sol' | 'sui';
    referredBy?: string;        // who referred this user
    nonce: Number;

    totalSentUSD: number;       // total $ amount user has sent
    totalReceivedUSD: number;   // total $ amount user has received

    sentCount: number;          // how many gifts user sent
    receivedCount: number;      // how many gifts user received

    socials: {
        platform: string;
        link: string;
    }[];

    createdAt: Date;
    updatedAt: Date;
    lastAvatarUpdate?: Date;
}

const UserSchema: Schema = new Schema(
    {
        username: {
            type: String, // referral ID
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
        chain: {
            type: String,
            required: true,
            enum: ['sol', 'sui']
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

        // --- Counts ---
        sentCount: {
            type: Number,
            default: 0
        },
        receivedCount: {
            type: Number,
            default: 0
        },

        socials: [
            {
                platform: String,
                link: String
            }
        ],

        lastAvatarUpdate: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
