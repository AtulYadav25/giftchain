import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/user.model';

declare module 'fastify' {
    interface FastifyRequest {
        user?: any;
    }
}

export const authenticate = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return reply.code(401).send({ message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded: any = verifyAccessToken(token);

        if (!decoded || !decoded.userId) {
            return reply.code(401).send({ message: 'Unauthorized: Invalid token' });
        }

        // Optional: Check if user exists in DB if needed, but for perf typical for JWT to just trust signature + expiry
        // const user = await User.findById(decoded.userId);
        // if (!user) throw new Error('User not found');

        req.user = decoded;
    } catch (error) {
        return reply.code(401).send({ message: 'Unauthorized: Invalid or expired token' });
    }
};
