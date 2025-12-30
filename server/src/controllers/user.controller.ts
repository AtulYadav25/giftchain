import { FastifyReply, FastifyRequest } from 'fastify';
import { User } from '../models/user.model';
import cloudinary from '../config/cloudinary';
import { errorResponse, successResponse } from '../utils/responseHandler';

export const getPublicUserDetails = async (req: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) => {
    try {
        const { username } = req.params;
        // Search safe public fields
        const user = await User.findOne({ username }).select('username avatar address createdAt totalSentUSD totalReceivedUSD sentCount receivedCount');

        if (!user) {
            return errorResponse(reply, "User not found", 404)
        }

        successResponse(reply, { user }, "User details fetched successfully", 200)
    } catch (error) {
        console.error('Error fetching public user details:', error);
        errorResponse(reply, "Internal server error", 500)
    }
};

export const updateProfile = async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.isMultipart()) {
        return errorResponse(reply, "Request must be multipart/form-data", 400)
    }

    const parts = req.parts();

    let newUsername: string | undefined;
    let avatarBuffer: Buffer | undefined;
    let avatarMime: string | undefined;

    try {
        for await (const part of parts) {
            if (part.type === 'file' && part.fieldname === 'avatar') {
                avatarMime = part.mimetype;
                const chunks: Buffer[] = [];
                for await (const chunk of part.file) {
                    chunks.push(chunk);
                }
                avatarBuffer = Buffer.concat(chunks);
            } else if (part.type === 'field' && part.fieldname === 'username') {
                newUsername = part.value as string;
            } else {
                if (part.type === 'file') part.file.resume(); // consume unused files
            }
        }
    } catch (err) {
        return errorResponse(reply, "Error processing upload", 500)
    }

    const user = await User.findById(req.user?.userId);
    if (!user) {
        return errorResponse(reply, "User not found", 404)
    }

    // 1. Handle Username Update
    if (newUsername) {
        if (user.username) {
            return errorResponse(reply, "Username can only be set once.", 400)
        }

        // Check uniqueness
        const exists = await User.findOne({ username: newUsername });
        if (exists) {
            return errorResponse(reply, "Username already taken", 400)
        }
        user.username = newUsername;
    }

    // 2. Handle Avatar Update
    if (avatarBuffer) {
        // Validation
        if (avatarBuffer.length > 1024 * 1024) { // 1 MB
            return errorResponse(reply, "Avatar file size must be < 1 MB.", 400)
        }
        if (!avatarMime?.startsWith('image/')) {
            return errorResponse(reply, "Invalid file format. Must be an image.", 400)
        }

        // Time check
        if (user.lastAvatarUpdate) {
            const now = new Date();
            const lastUpdate = new Date(user.lastAvatarUpdate);
            const diffMs = now.getTime() - lastUpdate.getTime();
            const sixHoursMs = 6 * 60 * 60 * 1000;

            if (diffMs < sixHoursMs) {
                return errorResponse(reply, "Avatar can only be updated once every 6 hours.", 400)
            }
        }

        // Upload
        try {
            const uploadResult: any = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'avatars', resource_type: 'image' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(avatarBuffer);
            });
            user.avatar = uploadResult.secure_url;
            user.lastAvatarUpdate = new Date();
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            return errorResponse(reply, "Failed to upload avatar", 500)
        }
    }

    await user.save();

    return successResponse(reply, { user }, "Profile updated successfully", 200)
};
