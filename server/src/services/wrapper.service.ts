import { Wrapper } from '../models/wrapper.model';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';
import sharp from 'sharp';


export const uploadWrapper = async (
    name: string,
    fileBuffer: Buffer,
    priceUSD: number,
    userId: string,
    resourceType: 'image' | 'video'
) => {
    // Check limit
    const wrapperCount = await Wrapper.countDocuments({ createdBy: userId });
    if (wrapperCount >= 5) {
        throw new Error('Limit reached: You cannot upload more than 5 wrappers');
    }

    let uploadBuffer = fileBuffer;

    // ---------------- Resize if image and > 500 KB ----------------
    if (resourceType === 'image' && fileBuffer.length > 500 * 1024) {
        try {
            uploadBuffer = await sharp(fileBuffer)
                .jpeg({ quality: 80 }) // compress
                .toBuffer();

            // Optional: you can further resize if still > 500 KB
            if (uploadBuffer.length > 500 * 1024) {
                uploadBuffer = await sharp(uploadBuffer)
                    .resize({ width: 1024 }) // scale down width proportionally
                    .jpeg({ quality: 75 })
                    .toBuffer();
            }
        } catch (err) {
            throw new Error('Failed to optimize wrapper image');
        }
    }

    // ---------------- Upload to Cloudinary ----------------
    const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'wrappers',
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(uploadBuffer);
    });

    if (!uploadResult || !uploadResult.secure_url) {
        throw new Error('Cloudinary upload failed');
    }

    const wrapper = await Wrapper.create({
        name,
        wrapperImg: `${uploadResult.public_id}.${uploadResult.format}`,
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
        cloudinary.uploader.destroy(wrapper.wrapperImg, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    });

    // Delete from DB
    await Wrapper.deleteOne({ _id: id });

    return { message: 'Wrapper deleted successfully' };
};

