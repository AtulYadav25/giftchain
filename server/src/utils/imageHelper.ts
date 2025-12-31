import { config } from "../config/env";

/**
 * Extracts the Cloudinary public ID from a stored path or full URL.
 * Returns the public ID including the file extension (e.g., "avatars/abc123.jpg")
 */
export function extractImagePublicId(pathOrUrl: string | null): string | null {
    if (!pathOrUrl) return null;

    // If path already includes CLOUD_NAME and IMAGE_HOST, strip the prefix
    if (pathOrUrl.startsWith(`${config.IMAGE_HOST}/${config.CLOUD_NAME}/image/upload/`)) {
        return pathOrUrl.replace(`${config.IMAGE_HOST}/${config.CLOUD_NAME}/image/upload/`, '');
    }

    // Otherwise, assume it's already the public_id with extension
    return pathOrUrl;
}


export function buildImageUrl(path: string) {
    if (!path) return null;

    if (path.includes("/free") || path.includes("/premium")) {
        return path;
    }

    return `${config.IMAGE_HOST}/${config.CLOUD_NAME}/image/upload/${path}`;
}