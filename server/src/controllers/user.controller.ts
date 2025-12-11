import { FastifyReply, FastifyRequest } from 'fastify';
import { User } from '../models/user.model';
import cloudinary from '../config/cloudinary';

export const getPublicUserDetails = async (req: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) => {
    try {
        const { username } = req.params;
        // Search safe public fields
        const user = await User.findOne({ username }).select('username avatar createdAt totalSentUSD totalReceivedUSD');

        if (!user) {
            return reply.code(404).send({ success: false, message: 'User not found' });
        }

        return reply.code(200).send({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching public user details:', error);
        return reply.code(500).send({ success: false, message: 'Internal server error' });
    }
};

export const updateProfile = async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.isMultipart()) {
        return reply.code(400).send({ success: false, message: 'Request must be multipart/form-data' });
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
        return reply.code(500).send({ success: false, message: 'Error processing upload' });
    }

    // @ts-ignore - Assuming user is populated by auth middleware
    const userId = req.user?.userId;
    if (!userId) {
        return reply.code(401).send({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
        return reply.code(404).send({ success: false, message: 'User not found' });
    }

    // 1. Handle Username Update
    if (newUsername) {
        if (user.username) {
            return reply.code(400).send({ success: false, message: 'Username can only be set once.' });
        }

        // Check uniqueness
        const exists = await User.findOne({ username: newUsername });
        if (exists) {
            return reply.code(400).send({ success: false, message: 'Username already taken' });
        }
        user.username = newUsername;
    }

    // 2. Handle Avatar Update
    if (avatarBuffer) {
        // Validation
        if (avatarBuffer.length > 1024 * 1024) { // 1 MB
            return reply.code(400).send({ success: false, message: 'Avatar file size must be < 1 MB.' });
        }
        if (!avatarMime?.startsWith('image/')) {
            return reply.code(400).send({ success: false, message: 'Invalid file format. Must be an image.' });
        }

        // Time check
        if (user.lastAvatarUpdate) {
            const now = new Date();
            const lastUpdate = new Date(user.lastAvatarUpdate);
            const diffMs = now.getTime() - lastUpdate.getTime();
            const sixHoursMs = 6 * 60 * 60 * 1000;

            if (diffMs < sixHoursMs) {
                return reply.code(400).send({ success: false, message: 'Avatar can only be updated once every 6 hours.' });
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
            return reply.code(500).send({ success: false, message: 'Failed to upload avatar' });
        }
    }

    await user.save();

    return reply.code(200).send({
        success: true,
        message: 'Profile updated successfully',
        data: {
            username: user.username,
            avatar: user.avatar,
            lastAvatarUpdate: user.lastAvatarUpdate
        }
    });
};
