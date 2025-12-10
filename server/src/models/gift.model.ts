import mongoose, { Schema, Document } from 'mongoose';

export interface IGift extends Document {
    senderId: mongoose.Types.ObjectId;
    receiverId?: mongoose.Types.ObjectId; // Optional, linked if user exists
    senderWallet: string;
    receiverWallet: string;

    amountUSD: number;
    tokenAmount: number;
    tokenSymbol: 'sui' | 'sol';

    wrapper: string;
    message?: string;

    status: 'sent' | 'opened';
    verified: Boolean;
    openedAt?: Date;

    senderTxHash?: string;
    deliveryTxHash?: string;

    chainID: 'sui' | 'solana';
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

        tokenAmount: {
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
            default: ''
        },

        status: {
            type: String,
            enum: ['sent', 'opened'],
            default: 'sent'
        },
        verified: {
            type: Boolean,
            default: false
        },
        openedAt: {
            type: Date
        },

        senderTxHash: {
            type: String,
            default: null
        },

        deliveryTxHash: {
            type: String,
            default: null
        },

        chainID: {
            type: String,
            enum: ['sui', 'solana'],
            default: 'sui'
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
GiftSchema.index({ senderId: 1 });
GiftSchema.index({ receiverWallet: 1 });
GiftSchema.index({ chainID: 1 });
GiftSchema.index({ status: 1 });

export const Gift = mongoose.model<IGift>('Gift', GiftSchema);
