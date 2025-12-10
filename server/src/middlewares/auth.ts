import { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../utils/jwt"; // adjust import

export const authenticate = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        // 1. Read cookie instead of Authorization header
        const token = req.cookies?.gc_token;

        if (!token) {
            return reply.code(401).send({ message: "Unauthorized: No token provided" });
        }

        // 2. Verify token
        const decoded: any = verifyAccessToken(token);

        if (!decoded || !decoded.address) {
            return reply.code(401).send({ message: "Unauthorized: Invalid token" });
        }

        // Attach user info to request
        req.user = decoded;

    } catch (error) {
        return reply.code(401).send({
            message: "Unauthorized: Invalid or expired token",
        });
    }
};
