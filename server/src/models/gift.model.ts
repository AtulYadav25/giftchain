import mongoose, { Schema, Document } from 'mongoose';

export interface IGift extends Document {
    senderId: mongoose.Types.ObjectId;
    receiverId?: mongoose.Types.ObjectId; // Optional, linked if user exists
    senderWallet: string;
    receiverWallet: string;

    amountUSD: number;
    feeUSD: number;
    totalTokenAmount: number;
    tokenSymbol: 'sui';
    suiStats: {
        suiPrice: number;
        suiHash: string;
    };

    wrapper: string;
    message?: string;

    status: 'unverified' | 'sent' | 'opened';
    isTxConfirmed: Boolean;
    openedAt?: Date;

    senderTxHash?: string;
    deliveryTxHash?: string;

    chainID: 'sui';
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

        suiStats: {
            suiPrice: {
                type: Number,
                required: true
            },
            suiHash: {
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
            enum: ['sui'],
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

        isTxConfirmed: {
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
            enum: ['sui'],
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
GiftSchema.index({ receiverWallet: 1 });
GiftSchema.index({ senderWallet: 1 });
GiftSchema.index({ chainID: 1 });
GiftSchema.index({ status: 1 });

export const Gift = mongoose.model<IGift>('Gift', GiftSchema);
