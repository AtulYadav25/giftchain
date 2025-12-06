import { Wrapper } from '../models/wrapper.model';

export const uploadWrapper = async (file: Buffer, filename: string, mimetype: string, userId: string) => {
    const wrapper = await Wrapper.create({
        name: filename,
        mimeType: mimetype,
        data: file,
        uploaderId: userId
    });
    return wrapper;
};

export const getWrappers = async () => {
    // Exclude heavy data buffer from list
    return Wrapper.find({}, { data: 0 });
};

export const getWrapperById = async (id: string) => {
    return Wrapper.findById(id);
};
