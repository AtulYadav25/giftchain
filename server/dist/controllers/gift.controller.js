"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.openGift = exports.getOne = exports.getReceived = exports.getSent = exports.sendGift = void 0;
const giftService = __importStar(require("../services/gift.service"));
const responseHandler_1 = require("../utils/responseHandler");
const sendGift = async (req, reply) => {
    try {
        const gift = await giftService.createGift(req.user.userId, req.body);
        //TODO: Verify Gift Sent Transaction
        (0, responseHandler_1.successResponse)(reply, gift, "Gift created successfully", 201);
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(reply, "Something went wrong", 500);
    }
};
exports.sendGift = sendGift;
const getSent = async (req, reply) => {
    try {
        const query = req.query;
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const { data, total } = await giftService.getSentGifts(req.params.username, page, limit);
        return (0, responseHandler_1.paginationResponse)(reply, data, total, page, limit, 200);
    }
    catch (error) {
        return (0, responseHandler_1.errorResponse)(reply, "Something went wrong", 500);
    }
};
exports.getSent = getSent;
const getReceived = async (req, reply) => {
    try {
        const query = req.query;
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const { data, total } = await giftService.getReceivedGifts(req.params.username, page, limit);
        return (0, responseHandler_1.paginationResponse)(reply, data, total, page, limit, 200);
    }
    catch (error) {
        return (0, responseHandler_1.errorResponse)(reply, "Something went wrong", 500);
    }
};
exports.getReceived = getReceived;
const getOne = async (req, reply) => {
    try {
        const gift = await giftService.getGiftById(req.params.id);
        (0, responseHandler_1.successResponse)(reply, gift, "Gift fetched successfully", 200);
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(reply, "Something went wrong", 500);
    }
};
exports.getOne = getOne;
const openGift = async (req, reply) => {
    try {
        const gift = await giftService.openGift(req.params.id, req.user.userId);
        (0, responseHandler_1.successResponse)(reply, gift, "Gift opened successfully", 200);
    }
    catch (error) {
        (0, responseHandler_1.errorResponse)(reply, "Something went wrong", 500);
    }
};
exports.openGift = openGift;
