"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWrapperById = exports.getWrappers = exports.uploadWrapper = void 0;
const wrapper_model_1 = require("../models/wrapper.model");
const uploadWrapper = async (name, url, publicId, priceUSD, userId) => {
    const wrapper = await wrapper_model_1.Wrapper.create({
        name,
        wrapperImg: url,
        publicId,
        priceUSD,
        createdBy: userId
    });
    return wrapper;
};
exports.uploadWrapper = uploadWrapper;
const getWrappers = async () => {
    // Return all wrappers
    return wrapper_model_1.Wrapper.find().sort({ createdAt: -1 });
};
exports.getWrappers = getWrappers;
const getWrapperById = async (id) => {
    return wrapper_model_1.Wrapper.findById(id);
};
exports.getWrapperById = getWrapperById;
