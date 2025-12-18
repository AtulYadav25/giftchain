import { Wrapper } from '../models/wrapper.model';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';


export const uploadWrapper = async (name: string, fileBuffer: Buffer, priceUSD: number, userId: string) => {
    // Check limit
    const wrapperCount = await Wrapper.countDocuments({ createdBy: userId });
    if (wrapperCount >= 5) {
        throw new Error('Limit reached: You cannot upload more than 5 wrappers');
    }

    // Upload image to Cloudinary

    const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'wrappers', resource_type: 'image' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        const stream = Readable.from(fileBuffer);
        stream.pipe(uploadStream);
    });

    if (!uploadResult || !uploadResult.secure_url) {
        throw new Error('Cloudinary upload failed');
    }

    const wrapper = await Wrapper.create({
        name,
        wrapperImg: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        priceUSD,
        createdBy: userId,
        customWrapper: true
    });
    return wrapper;
};


export const getWrappers = async (userId: string) => {
    // Return system wrappers (customWrapper: false) OR user's own wrappers
    return Wrapper.find({
        $or: [
            { customWrapper: false },
            { createdBy: userId }
        ]
    }).sort({ createdAt: -1 });
};


export const getWrapperById = async (id: string) => {
    return Wrapper.findById(id);
};

export const deleteWrapper = async (id: string, userId: string) => {
    const wrapper = await Wrapper.findOne({ _id: id, createdBy: userId });

    if (!wrapper) {
        throw new Error('Wrapper not found or unauthorized');
    }

    // Delete from Cloudinary
    await new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(wrapper.publicId, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    });

    // Delete from DB
    await Wrapper.deleteOne({ _id: id });

    return { message: 'Wrapper deleted successfully' };
};

