import { FastifyReply, FastifyRequest } from 'fastify';
import * as authService from '../services/auth.service';

export const signup = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const user = await authService.signup(req.body);
        reply.code(201).send(user);
    } catch (error: any) {
        reply.code(400).send({ message: error.message });
    }
};

export const login = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const result = await authService.login(req.body);
        reply.send(result);
    } catch (error: any) {
        reply.code(401).send({ message: error.message });
    }
};

export const refresh = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { refreshToken } = req.body as { refreshToken: string };
        const result = await authService.refreshToken(refreshToken);
        reply.send(result);
    } catch (error: any) {
        reply.code(401).send({ message: error.message });
    }
};

export const me = async (req: FastifyRequest, reply: FastifyReply) => {
    reply.send(req.user);
};
