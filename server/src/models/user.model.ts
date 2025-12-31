import mongoose, { Schema, Document } from 'mongoose';
import { buildImageUrl } from '../utils/imageHelper';

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

    bio?: string[];
    banner?: string;
    settings?: {
        show_gift_sent: Boolean;
    };

    createdAt: Date;
    updatedAt: Date;
    usernameLower: string;
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
            default: 0,
            index: true
        },
        totalReceivedUSD: {
            type: Number,
            default: 0,
            index: true
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

        bio: {
            type: [String],
            default: ["Hey, I'm On GiftChain"]
        },
        banner: {
            type: String,
            default: null
        },

        settings: {
            show_gift_sent: {
                type: Boolean,
                default: true
            }
        },
        usernameLower: {
            type: String,
            unique: true,
            default: null
        },

        lastAvatarUpdate: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                if (ret.banner) {
                    ret.banner = buildImageUrl(ret.banner);
                }

                if (ret.avatar) {
                    ret.avatar = buildImageUrl(ret.avatar);
                }

                return ret;
            }
        }
    }
);

export const User = mongoose.model<IUser>('User', UserSchema);
