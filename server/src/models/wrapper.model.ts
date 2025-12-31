import mongoose, { Schema, Document } from 'mongoose';
import { buildImageUrl } from '../utils/imageHelper';

export interface IWrapper extends Document {
    name: string;
    wrapperImg: string; // Cloudinary URL
    publicId: string;   // Cloudinary Public ID
    priceUSD: number;
    createdBy: mongoose.Types.ObjectId;
    customWrapper: boolean;
    createdAt: Date;
}

const WrapperSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        wrapperImg: { type: String, required: true },
        publicId: { type: String, required: true },
        priceUSD: { type: Number, required: true },
        customWrapper: { type: Boolean, default: true },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                if (ret.wrapperImg) {
                    ret.wrapperImg = buildImageUrl(ret.wrapperImg);
                }

                return ret;
            }
        }
    }
);


export const Wrapper = mongoose.model<IWrapper>('Wrapper', WrapperSchema);
