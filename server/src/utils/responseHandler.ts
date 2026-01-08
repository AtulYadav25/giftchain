import { FastifyReply } from "fastify";

export const successResponse = (reply: FastifyReply, responseData = {}, message = "Success", statusCode = 200) => {
    return reply.code(statusCode).send({
        success: true,
        message,
        data: responseData,
    });
};

export const errorResponse = (reply: FastifyReply, message = "Something went wrong", statusCode = 500, error = null) => {
    return reply.code(statusCode).send({
        success: false,
        message,
        data: null,
        error
    });
};



/**
 * Standard pagination response formatter
 * @param {Object} res - Express response object
 * @param {Array} data - Array of results (docs)
 * @param {Number} total - Total number of records in DB
 * @param {Number} page - Current page number
 * @param {Number} limit - Records per page
 * @param {Number} statusCode - HTTP status code (default 200)
 */

export const paginationResponse = (
    reply,
    data,
    total,
    page,
    limit,
    statusCode = 200
) => {
    const totalPages = total ? Math.ceil(total / limit) : null;

    return reply
        .code(statusCode)
        .send({
            success: true,
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
};
