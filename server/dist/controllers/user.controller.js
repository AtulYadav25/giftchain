"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getPublicUserDetails = void 0;
const user_model_1 = require("../models/user.model");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const responseHandler_1 = require("../utils/responseHandler");
const getPublicUserDetails = async (req, reply) => {
    try {
        const { username } = req.params;
        // Search safe public fields
        const user = await user_model_1.User.findOne({ username }).select('username avatar address createdAt totalSentUSD totalReceivedUSD sentCount receivedCount');
        if (!user) {
            return (0, responseHandler_1.errorResponse)(reply, "User not found", 404);
        }
        (0, responseHandler_1.successResponse)(reply, { user }, "User details fetched successfully", 200);
    }
    catch (error) {
        console.error('Error fetching public user details:', error);
        (0, responseHandler_1.errorResponse)(reply, "Internal server error", 500);
    }
};
exports.getPublicUserDetails = getPublicUserDetails;
const updateProfile = async (req, reply) => {
    if (!req.isMultipart()) {
        return (0, responseHandler_1.errorResponse)(reply, "Request must be multipart/form-data", 400);
    }
    const parts = req.parts();
    let newUsername;
    let avatarBuffer;
    let avatarMime;
    try {
        for await (const part of parts) {
            if (part.type === 'file' && part.fieldname === 'avatar') {
                avatarMime = part.mimetype;
                const chunks = [];
                for await (const chunk of part.file) {
                    chunks.push(chunk);
                }
                avatarBuffer = Buffer.concat(chunks);
            }
            else if (part.type === 'field' && part.fieldname === 'username') {
                newUsername = part.value;
            }
            else {
                if (part.type === 'file')
                    part.file.resume(); // consume unused files
            }
        }
    }
    catch (err) {
        return (0, responseHandler_1.errorResponse)(reply, "Error processing upload", 500);
    }
    // @ts-ignore - Assuming user is populated by auth middleware
    const userId = req.user?.userId;
    if (!userId) {
        return (0, responseHandler_1.errorResponse)(reply, "Unauthorized", 401);
    }
    const user = await user_model_1.User.findById(userId);
    if (!user) {
        return (0, responseHandler_1.errorResponse)(reply, "User not found", 404);
    }
    // 1. Handle Username Update
    if (newUsername) {
        if (user.username) {
            return (0, responseHandler_1.errorResponse)(reply, "Username can only be set once.", 400);
        }
        // Check uniqueness
        const exists = await user_model_1.User.findOne({ username: newUsername });
        if (exists) {
            return (0, responseHandler_1.errorResponse)(reply, "Username already taken", 400);
        }
        user.username = newUsername;
    }
    // 2. Handle Avatar Update
    if (avatarBuffer) {
        // Validation
        if (avatarBuffer.length > 1024 * 1024) { // 1 MB
            return (0, responseHandler_1.errorResponse)(reply, "Avatar file size must be < 1 MB.", 400);
        }
        if (!avatarMime?.startsWith('image/')) {
            return (0, responseHandler_1.errorResponse)(reply, "Invalid file format. Must be an image.", 400);
        }
        // Time check
        if (user.lastAvatarUpdate) {
            const now = new Date();
            const lastUpdate = new Date(user.lastAvatarUpdate);
            const diffMs = now.getTime() - lastUpdate.getTime();
            const sixHoursMs = 6 * 60 * 60 * 1000;
            if (diffMs < sixHoursMs) {
                return (0, responseHandler_1.errorResponse)(reply, "Avatar can only be updated once every 6 hours.", 400);
            }
        }
        // Upload
        try {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary_1.default.uploader.upload_stream({ folder: 'avatars', resource_type: 'image' }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
                stream.end(avatarBuffer);
            });
            user.avatar = uploadResult.secure_url;
            user.lastAvatarUpdate = new Date();
        }
        catch (error) {
            console.error('Cloudinary upload error:', error);
            return (0, responseHandler_1.errorResponse)(reply, "Failed to upload avatar", 500);
        }
    }
    await user.save();
    return (0, responseHandler_1.successResponse)(reply, { user }, "Profile updated successfully", 200);
};
exports.updateProfile = updateProfile;
