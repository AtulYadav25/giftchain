import { Wrapper } from '../models/wrapper.model';

export const uploadWrapper = async (name: string, url: string, publicId: string, priceUSD: number, userId: string) => {
    const wrapper = await Wrapper.create({
        name,
        wrapperImg: url,
        publicId,
        priceUSD,
        createdBy: userId
    });
    return wrapper;
};

export const getWrappers = async () => {
    // Return all wrappers
    return Wrapper.find().sort({ createdAt: -1 });
};

export const getWrapperById = async (id: string) => {
    return Wrapper.findById(id);
};
