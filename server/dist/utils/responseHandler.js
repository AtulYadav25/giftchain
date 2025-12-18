"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationResponse = exports.errorResponse = exports.successResponse = void 0;
const successResponse = (reply, responseData = {}, message = "Success", statusCode = 200) => {
    return reply.code(statusCode).send({
        success: true,
        message,
        data: responseData,
    });
};
exports.successResponse = successResponse;
const errorResponse = (reply, message = "Something went wrong", statusCode = 500, error = null) => {
    return reply.code(statusCode).send({
        success: false,
        message,
        data: null,
        error
    });
};
exports.errorResponse = errorResponse;
/**
 * Standard pagination response formatter
 * @param {Object} res - Express response object
 * @param {Array} data - Array of results (docs)
 * @param {Number} total - Total number of records in DB
 * @param {Number} page - Current page number
 * @param {Number} limit - Records per page
 * @param {Number} statusCode - HTTP status code (default 200)
 */
const paginationResponse = (res, data, total, page, limit, statusCode = 200) => {
    const totalPages = Math.ceil(total / limit);
    return res.status(statusCode).json({
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
exports.paginationResponse = paginationResponse;
