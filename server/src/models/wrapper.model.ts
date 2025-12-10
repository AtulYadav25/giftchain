import mongoose, { Schema, Document } from 'mongoose';
export interface IWrapper extends Document {
    name: string;
    wrapperImg: string; // Cloudinary URL
    publicId: string;   // Cloudinary Public ID
    priceUSD: number;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
}

const WrapperSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        wrapperImg: { type: String, required: true },
        publicId: { type: String, required: true },
        priceUSD: { type: Number, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);


export const Wrapper = mongoose.model<IWrapper>('Wrapper', WrapperSchema);
