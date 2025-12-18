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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOne = exports.getAll = exports.upload = void 0;
const wrapperService = __importStar(require("../services/wrapper.service"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const upload = async (req, reply) => {
    const parts = req.parts();
    let name;
    let priceUSD;
    let imgUrl;
    let publicId;
    try {
        for await (const part of parts) {
            if (part.type === 'file') {
                const result = await new Promise((resolve, reject) => {
                    const upload_stream = cloudinary_1.default.uploader.upload_stream({ folder: 'wrappers' }, (error, result) => {
                        if (error)
                            reject(error);
                        else
                            resolve(result);
                    });
                    part.file.pipe(upload_stream);
                });
                imgUrl = result.secure_url;
                publicId = result.public_id;
            }
            else {
                if (part.fieldname === 'name')
                    name = part.value;
                if (part.fieldname === 'priceUSD')
                    priceUSD = parseFloat(part.value);
            }
        }
        if (!imgUrl || !publicId || !name || priceUSD === undefined) {
            return reply.code(400).send({ message: 'Missing required fields (file, name, priceUSD)' });
        }
        const wrapper = await wrapperService.uploadWrapper(name, imgUrl, publicId, priceUSD, req.user.userId);
        reply.code(201).send(wrapper);
    }
    catch (error) {
        console.error(error);
        reply.code(500).send({ message: 'Upload failed' });
    }
};
exports.upload = upload;
const getAll = async (req, reply) => {
    const wrappers = await wrapperService.getWrappers();
    reply.send(wrappers);
};
exports.getAll = getAll;
const getOne = async (req, reply) => {
    try {
        const wrapper = await wrapperService.getWrapperById(req.params.id);
        if (!wrapper)
            return reply.code(404).send({ message: 'Wrapper not found' });
        reply.send(wrapper);
    }
    catch (error) {
        reply.code(404).send({ message: 'Wrapper not found' });
    }
};
exports.getOne = getOne;
