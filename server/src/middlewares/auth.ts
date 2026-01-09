import { FastifyRequest, FastifyReply } from "fastify";
import { verifyAccessToken } from "../utils/jwt";

export const authenticate = (options?: { optional?: boolean }) => {
    return async (req: FastifyRequest, reply: FastifyReply) => {
        try {
            const token = req.cookies?.gc_token;

            if (!token) {
                if (options?.optional) {
                    req.user = null;
                    return;
                }
                return reply.code(401).send({ message: "Unauthorized: No token provided" });
            }

            const decoded: any = verifyAccessToken(token);

            if (!decoded || !decoded.address) {
                if (options?.optional) {
                    req.user = null;
                    return;
                }
                return reply.code(401).send({ message: "Unauthorized: Invalid token" });
            }

            req.user = decoded;

        } catch (err) {
            if (options?.optional) {
                req.user = null;
                return;
            }
            return reply.code(401).send({
                message: "Unauthorized: Invalid or expired token",
            });
        }
    };
};
