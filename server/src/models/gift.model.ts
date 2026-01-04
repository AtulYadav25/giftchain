import { Hash } from 'crypto';
import mongoose, { Schema, Document } from 'mongoose';
import { buildImageUrl } from '../utils/imageHelper';

export interface IGift extends Document {
    senderId: mongoose.Types.ObjectId;
    receiverId?: mongoose.Types.ObjectId; // Optional, linked if user exists
    senderWallet: string;
    receiverWallet: string;

    amountUSD: number;
    feeUSD: number;
    totalTokenAmount: number; //In Token Value MIST or LAMPORTS e.g: 1.1 SUI as 11110000 MIST or 4.5 SOL 45000000 LAMPORTS (Does not includes fees)
    tokenSymbol: 'sui' | 'sol';
    tokenStats: {
        tokenPrice: number; //Price is in USD (Fetched From CMC API)
        tokenHash: string; //Includes Server JWT encrypted object {tokenPrice: //}
    };

    wrapper: string;
    message?: string;

    mediaType: 'image' | 'video';

    status: 'unverified' | 'sent' | 'opened';
    verified: Boolean;
    openedAt?: Date;

    senderTxDigest?: string;

    chain: 'sui' | 'sol';
    isAnonymous?: boolean;
}

const GiftSchema: Schema = new Schema(
    {
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        senderWallet: {
            type: String,
            required: true
        },

        receiverWallet: {
            type: String,
            required: true
        },

        receiverId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },

        amountUSD: {
            type: Number,
            required: true
        },

        feeUSD: {
            type: Number,
            required: true
        },

        tokenStats: {
            tokenPrice: {
                type: Number,
                required: true
            },
            tokenHash: {
                type: String,
                required: true
            }
        },

        totalTokenAmount: {
            type: Number,
            required: true
        },

        tokenSymbol: {
            type: String,
            enum: ['sui', 'sol'],
            required: true
        },

        wrapper: {
            type: String,
            required: true
        },

        message: {
            type: String,
            trim: true,
            default: ''
        },


        status: {
            type: String,
            enum: ['unverified', 'sent', 'opened'],
            default: 'unverified'
        },

        verified: {
            type: Boolean,
            default: false
        },

        openedAt: {
            type: Date
        },

        senderTxDigest: {
            type: String,
            default: null
        },

        chain: {
            type: String,
            enum: ['sui', 'sol'],
            default: 'sui'
        },

        mediaType: {
            type: String,
            enum: ['image', 'video'],
            default: 'image'
        },

        isAnonymous: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                if (ret.isAnonymous) {
                    delete ret.senderId;
                }

                if (ret.wrapper) {
                    ret.wrapper = buildImageUrl(ret.wrapper);
                }

                return ret;
            }
        },
        toObject: {
            transform(doc, ret) {
                if (ret.isAnonymous) {
                    delete ret.senderId;
                }
                return ret;
            }
        }
    }

);

// Indexes
GiftSchema.index({ receiverWallet: 1 });
GiftSchema.index({ senderWallet: 1 });
GiftSchema.index({ chain: 1 });
GiftSchema.index({ status: 1 });

export const Gift = mongoose.model<IGift>('Gift', GiftSchema);
