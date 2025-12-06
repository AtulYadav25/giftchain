import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export const errorHandler = (error: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof ZodError) {
        return reply.status(400).send({
            message: 'Validation Error',
            errors: error.format(),
        });
    }

    console.error('SERVER ERROR:', error);
    reply.status(500).send({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
};
