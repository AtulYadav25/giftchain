"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrice = void 0;
const price_service_1 = require("../services/price.service");
const getPrice = async (req, reply) => {
    try {
        const price = await (0, price_service_1.getSuiPrice)();
        return reply.code(200).send({
            success: true,
            priceUsd: price
        });
    }
    catch (error) {
        console.error('Price fetch error:', error);
        return reply.code(500).send({
            success: false,
            message: 'Failed to retrieve SUI price'
        });
    }
};
exports.getPrice = getPrice;
