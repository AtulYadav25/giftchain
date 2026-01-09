import { FastifyReply, FastifyRequest } from 'fastify';
import { User } from '../models/user.model';
import cloudinary from '../config/cloudinary';
import { errorResponse, paginationResponse, successResponse } from '../utils/responseHandler';
import sharp from 'sharp';


export const getPublicUserDetails = async (req: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) => {
    try {
        const { username } = req.params;
        // Search safe public fields
        const user = await User.findOne({ usernameLower: username.toLowerCase() }).select('username avatar bio banner chain alternateAddresses settings socials address createdAt totalSentUSD sentCount receivedCount');

        if (!user) {
            return errorResponse(reply, "User not found", 404)
        }

        successResponse(reply, { user }, "User details fetched successfully", 200)
    } catch (error) {
        errorResponse(reply, "Internal server error", 500)
    }
};


export const getTopGivers = async (req: FastifyRequest<{ Params: { username: string } }>, reply: FastifyReply) => {
    try {
        const query = req.query as { page?: string; limit?: string };
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;

        //validate page and limit
        if (page < 1 || limit < 1 || page > 100 || limit > 25) {
            return errorResponse(reply, "Invalid page or limit", 400)
        }

        const users = await User.find({}).sort({ totalSentUSD: -1 }).skip((page - 1) * limit).limit(limit).select('username avatar socials chain totalSentUSD');

        paginationResponse(reply, users, 100, page, limit, 200)
    } catch (error) {
        errorResponse(reply, "Internal server error", 500)
    }
};

const safeJsonParse = <T>(value: unknown): T | undefined => {
    if (typeof value !== 'string' || !value.trim()) return undefined;
    try {
        return JSON.parse(value);
    } catch {
        return undefined;
    }
};


export const updateProfile = async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.isMultipart()) {
        return errorResponse(reply, "Request must be multipart/form-data", 400);
    }

    const parts = req.parts();

    let newUsername: string | undefined;

    let avatarBuffer: Buffer | undefined;
    let avatarMime: string | undefined;

    let bannerBuffer: Buffer | undefined;
    let bannerMime: string | undefined;

    let bio: string[] | undefined;
    let settings: any | undefined;
    let socials: { platform: string, link: string }[] | undefined;

    let alternateAddresses: { chain: string, address: string }[] | undefined;

    try {
        for await (const part of req.parts()) {
            if (part.type === 'file' && part.fieldname === 'avatar') {
                avatarMime = part.mimetype;
                avatarBuffer = await part.toBuffer();
            }

            else if (part.type === 'file' && part.fieldname === 'banner') {
                bannerMime = part.mimetype;
                bannerBuffer = await part.toBuffer();
            }

            else if (part.type === 'field' && part.fieldname === 'username') {
                newUsername = part.value as string;
            }

            else if (part.type === 'field' && part.fieldname === 'bio') {
                bio = safeJsonParse<string[]>(part.value);
            }

            else if (part.type === 'field' && part.fieldname === 'settings') {
                settings = safeJsonParse(part.value);
            }

            else if (part.type === 'field' && part.fieldname === 'alternateAddresses') {
                alternateAddresses = safeJsonParse<{ chain: string, address: string }[]>(part.value);
            }

            else if (part.type === 'field' && part.fieldname === 'socials') {
                socials = safeJsonParse(part.value);
            }

            else if (part.type === 'file') {
                part.file.resume();
            }
        }
    } catch (err: any) {

        if (err.code === 'FST_REQ_FILE_TOO_LARGE') {
            return errorResponse(reply, 'File too large. Max 4MB allowed.', 413);
        }

        return errorResponse(reply, 'Error processing upload', 500);
    }

    const user = await User.findById(req.user?.userId);
    if (!user) {
        return errorResponse(reply, "User not found", 404);
    }

    /* ---------------- Username (one-time only) ---------------- */
    if (newUsername) {
        if (!user.username.includes("gc@") || newUsername === "profile") { //if Username includes gc@ means it is set by the backend and it is temprorary username
            return errorResponse(reply, "Unable to set username", 400);
        }

        const normalized = newUsername.trim().toLowerCase();
        // Check uniqueness
        const exists = await User.findOne({ usernameLower: normalized });
        if (exists) {
            return errorResponse(reply, "Username already taken", 400)
        }

        if (!/^[a-z0-9_]{3,20}$/.test(normalized)) {
            return errorResponse(reply, "Invalid username", 400);
        }

        user.legal.terms.accepted = true;
        user.legal.privacy.accepted = true;
        user.legal.terms.acceptedAt = new Date();
        user.legal.privacy.acceptedAt = new Date();

        user.username = newUsername.trim();
        user.usernameLower = normalized;
    }


    /* ---------------- Avatar Upload ---------------- */
    if (avatarBuffer) {
        if (avatarBuffer.length > 5 * 1024 * 1024) {
            return errorResponse(reply, "Avatar file size must be < 5 MB.", 400);
        }

        if (!avatarMime?.startsWith("image/")) {
            return errorResponse(reply, "Invalid avatar format. Must be an image.", 400);
        }

        if (user.lastAvatarUpdate) {
            const diff = Date.now() - new Date(user.lastAvatarUpdate).getTime();
            if (diff < 6 * 60 * 60 * 1000) {
                return errorResponse(
                    reply,
                    "Avatar can only be updated once every 6 hours.",
                    400
                );
            }
        }

        try {
            // ✅ Delete previous avatar if exists
            if (user.avatar) {
                const previousPublicId = user.avatar.replace(/\.jpg$/, "");
                await cloudinary.uploader.destroy(previousPublicId, { resource_type: "image" });
            }

            // ✅ Resize + crop avatar to square
            const optimizedAvatar = await sharp(avatarBuffer)
                .resize(256, 256, {
                    fit: "cover",
                    position: "centre"
                })
                .jpeg({ quality: 85 })
                .toBuffer();

            const uploadResult: any = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "avatars",
                        resource_type: "image",
                        format: "jpg"
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(optimizedAvatar);
            });

            user.avatar = `${uploadResult.public_id}.jpg`;
            user.lastAvatarUpdate = new Date();
        } catch (error) {
            return errorResponse(reply, "Failed to upload avatar", 500);
        }
    }

    /* ---------------- Banner Upload ---------------- */
    if (bannerBuffer) {
        if (bannerBuffer.length > 5 * 1024 * 1024) {
            return errorResponse(reply, "Banner file size must be < 5 MB.", 400);
        }

        if (!bannerMime?.startsWith("image/")) {
            return errorResponse(reply, "Invalid banner format. Must be an image.", 400);
        }

        try {
            // ✅ Delete previous banner if exists
            if (user.banner) {
                const previousPublicId = user.banner.replace(/\.jpg$/, "");
                await cloudinary.uploader.destroy(previousPublicId, { resource_type: "image" });
            }

            // ✅ Crop center to 3:1 and resize
            const optimizedBanner = await sharp(bannerBuffer)
                .resize(1200, 400, {
                    fit: "cover",
                    position: "centre",
                    withoutEnlargement: true, // prevents upscaling
                })
                .jpeg({ quality: 90 })
                .toBuffer();

            const uploadResult: any = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "banners",
                        resource_type: "image",
                        format: "jpg"
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(optimizedBanner);
            });

            user.banner = `${uploadResult.public_id}.jpg`;
        } catch (error) {
            return errorResponse(reply, "Failed to upload banner", 500);
        }
    }


    /* ---------------- Bio ---------------- */
    if (bio) {
        if (!Array.isArray(bio)) {
            return errorResponse(reply, "Invalid bio format", 400);
        }

        // Ensure all items are strings
        if (!bio.every(item => typeof item === "string")) {
            return errorResponse(reply, "Bio must be an array of strings", 400);
        }

        // Count total characters
        const totalChars = bio.reduce(
            (sum, line) => sum + line.length,
            0
        );

        if (totalChars > 600) {
            return errorResponse(
                reply,
                "Bio must not exceed 600 characters in total",
                400
            );
        }

        user.bio = bio;
    }

    /* ---------------- Settings ---------------- */
    if (settings) {
        user.settings = {
            show_gift_sent: settings.show_gift_sent
        };
    }

    if (alternateAddresses) {
        if (!Array.isArray(alternateAddresses) || alternateAddresses.length > 1) {
            return errorResponse(reply, "Invalid alternate addresses format", 400);
        }
        user.alternateAddresses = alternateAddresses;
    }

    /* ---------------- Socials ---------------- */
    if (socials) {
        user.socials = socials;
    }

    await user.save();

    return successResponse(
        reply,
        { user },
        "Profile updated successfully",
        200
    );
};
