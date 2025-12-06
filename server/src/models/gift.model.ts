import mongoose, { Schema, Document } from 'mongoose';

export interface IGift extends Document {
    senderId: mongoose.Types.ObjectId;
    receiverId?: mongoose.Types.ObjectId; // Optional if sent to non-user (link) or username not resolved yet
    receiverWallet?: string;
    wrapperId: mongoose.Types.ObjectId;
    message?: string;
    status: 'sent' | 'opened';
    openedAt?: Date;
    blockchainTxDigest?: string; // SUI or SOL tx hash
    chainId?: 'sui' | 'solana';
}

const GiftSchema: Schema = new Schema({
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User' },
    receiverWallet: { type: String },
    wrapperId: { type: Schema.Types.ObjectId, ref: 'Wrapper', required: true },
    message: { type: String },
    status: { type: String, enum: ['sent', 'opened'], default: 'sent' },
    openedAt: { type: Date },
    blockchainTxDigest: { type: String },
    chainId: { type: String, enum: ['sui', 'solana'] },
}, { timestamps: true });

export const Gift = mongoose.model<IGift>('Gift', GiftSchema);
