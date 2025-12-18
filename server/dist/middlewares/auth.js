"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt"); // adjust import
const authenticate = async (req, reply) => {
    try {
        // 1. Read cookie instead of Authorization header
        const token = req.cookies?.gc_token;
        if (!token) {
            return reply.code(401).send({ message: "Unauthorized: No token provided" });
        }
        // 2. Verify token
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        if (!decoded || !decoded.address) {
            return reply.code(401).send({ message: "Unauthorized: Invalid token" });
        }
        // Attach user info to request
        req.user = decoded;
    }
    catch (error) {
        return reply.code(401).send({
            message: "Unauthorized: Invalid or expired token",
        });
    }
};
exports.authenticate = authenticate;
