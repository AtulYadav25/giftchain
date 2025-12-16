
export interface Wrapper {
    _id: string | number;
    name: string;
    wrapperImg: string; // Cloudinary URL
    publicId?: string;   // Cloudinary Public ID
    priceUSD: number;
    createdBy?: string;
    customWrapper?: boolean;
    createdAt?: Date;
}