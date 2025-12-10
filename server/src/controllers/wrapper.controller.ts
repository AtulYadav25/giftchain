import { FastifyReply, FastifyRequest } from 'fastify';
import * as wrapperService from '../services/wrapper.service';
import cloudinary from '../config/cloudinary';

export const upload = async (req: FastifyRequest, reply: FastifyReply) => {
    const parts = req.parts();
    let name: string | undefined;
    let priceUSD: number | undefined;
    let imgUrl: string | undefined;
    let publicId: string | undefined;

    try {
        for await (const part of parts) {
            if (part.type === 'file') {
                const result: any = await new Promise((resolve, reject) => {
                    const upload_stream = cloudinary.uploader.upload_stream(
                        { folder: 'wrappers' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    part.file.pipe(upload_stream);
                });
                imgUrl = result.secure_url;
                publicId = result.public_id;
            } else {
                if (part.fieldname === 'name') name = part.value as string;
                if (part.fieldname === 'priceUSD') priceUSD = parseFloat(part.value as string);
            }
        }

        if (!imgUrl || !publicId || !name || priceUSD === undefined) {
            return reply.code(400).send({ message: 'Missing required fields (file, name, priceUSD)' });
        }

        const wrapper = await wrapperService.uploadWrapper(name, imgUrl, publicId, priceUSD, req.user!.userId);
        reply.code(201).send(wrapper);
    } catch (error: any) {
        console.error(error);
        reply.code(500).send({ message: 'Upload failed' });
    }
};

export const getAll = async (req: FastifyRequest, reply: FastifyReply) => {
    const wrappers = await wrapperService.getWrappers();
    reply.send(wrappers);
};

export const getOne = async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
        const wrapper = await wrapperService.getWrapperById(req.params.id);
        if (!wrapper) return reply.code(404).send({ message: 'Wrapper not found' });
        reply.send(wrapper);
    } catch (error) {
        reply.code(404).send({ message: 'Wrapper not found' });
    }
};
