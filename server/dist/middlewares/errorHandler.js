"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (error, req, reply) => {
    if (error instanceof zod_1.ZodError) {
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
exports.errorHandler = errorHandler;
