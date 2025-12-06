import mongoose, { Schema, Document } from 'mongoose';

export interface IWrapper extends Document {
    name: string;
    mimeType: string;
    data: Buffer;
    uploaderId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const WrapperSchema: Schema = new Schema({
    name: { type: String, required: true },
    mimeType: { type: String, required: true },
    data: { type: Buffer, required: true },
    uploaderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Wrapper = mongoose.model<IWrapper>('Wrapper', WrapperSchema);
