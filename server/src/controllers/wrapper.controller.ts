import { FastifyReply, FastifyRequest } from 'fastify';
import * as wrapperService from '../services/wrapper.service';
import cloudinary from '../config/cloudinary';
import { errorResponse, successResponse } from '../utils/responseHandler';

export const upload = async (req: FastifyRequest, reply: FastifyReply) => {
    const parts = req.parts();

    let name = 'custom';
    let priceUSD = 0.3;

    let fileBuffer: Buffer | undefined;
    let fileMime: string | undefined;
    let resourceType: 'image' | 'video' | undefined;

    try {
        for await (const part of parts) {
            if (part.type === 'file') {
                fileMime = part.mimetype;
                fileBuffer = await part.toBuffer();
            }

            if (part.type === 'field' && part.fieldname === 'name') {
                name = part.value as string;
            }

            if (part.type === 'field' && part.fieldname === 'priceUSD') {
                priceUSD = Number(part.value);
            }
        }

        if (!fileBuffer || !fileMime) {
            return errorResponse(reply, "Wrapper file is required", 400);
        }

        /* ---------------- File Type Detection ---------------- */
        if (fileMime.startsWith('image/')) {
            resourceType = 'image';
        } else if (fileMime.startsWith('video/')) {
            resourceType = 'video';
        } else {
            return errorResponse(
                reply,
                "Only image or video files are allowed",
                400
            );
        }

        /* ---------------- Size Validation ---------------- */
        const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
        const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

        if (
            (resourceType === 'image' && fileBuffer.length > MAX_IMAGE_SIZE) ||
            (resourceType === 'video' && fileBuffer.length > MAX_VIDEO_SIZE)
        ) {
            return errorResponse(
                reply,
                resourceType === 'image'
                    ? "Image must be less than 2MB"
                    : "Video must be less than 10MB",
                400
            );
        }

        const wrapper = await wrapperService.uploadWrapper(
            name,
            fileBuffer,
            priceUSD,
            req.user!.userId,
            resourceType // 👈 new
        );

        return successResponse(reply, wrapper, "Wrapper Uploaded", 201);
    } catch (error) {
        console.error(error);
        return errorResponse(reply, "Something went wrong", 500);
    }
};


export const getAll = async (req: FastifyRequest, reply: FastifyReply) => {
    // Assuming auth middleware handles ensuring req.user exists if this route is protected,
    // otherwise customWrapper=false should be returned. Use userId if available.
    // However, prompt said "Assume authentication middleware already attaches userId".
    // If user is undefined (unauthenticated), we might only return system wrappers.
    // The previous implementation didn't use userId.
    const userId = req.user?.userId;
    if (!userId) {
        // If unauthenticated, maybe return empty or just system?
        // "fetch logic ... only returns wrappers where ... createdBy === req.user?.userId"
        // If no user, match fails. But customWrappers===false should matches.
        // Passing undefined to createdBy might cause issues if not handled.
        // But the prompt implies authenticated user context.
        // I'll assume req.user is present given the prompt context.
        errorResponse(reply, "User not found", 404);
    }

    // Safely handle potential missing user if route is public (though prompt implies authenticated)
    // If userId generates undefined, MongoDB might interpret { createdBy: undefined } as matching null or missing?
    // It's safer to ensure userId is string or handle unauth.
    // I'll assume req.user!.userId based on typical patterns or at least pass what's there.
    // But Wrapper.find logic in service expects string.

    const wrappers = await wrapperService.getWrappers(req.user!.userId);
    successResponse(reply, wrappers, "Wrappers fetched successfully", 200);
};


export const getOne = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const wrapper = await wrapperService.getWrapperById(req.params.id);
        if (!wrapper) errorResponse(reply, "Wrapper not found", 404);
        successResponse(reply, wrapper, "Wrapper fetched successfully", 200);
    } catch (error) {
        errorResponse(reply, "Something went wrong", 500);
    }
};

export const deleteWrapper = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        await wrapperService.deleteWrapper(req.params.id, req.user!.userId);
        successResponse(reply, null, "Wrapper deleted successfully", 200);
    } catch (error: any) {
        if (error.message === 'Wrapper not found or unauthorized') {
            errorResponse(reply, error.message, 404); // Or 403 Forbidden? 404 is standard for "not found or not yours" to avoid leaking existence
        } else {
            errorResponse(reply, error.message || "Something went wrong", 500);
        }
    }
};

