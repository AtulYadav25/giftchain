import { FastifyReply, FastifyRequest } from 'fastify';
import * as wrapperService from '../services/wrapper.service';

export const upload = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const data = await req.file();
        if (!data) return reply.code(400).send({ message: 'No file uploaded' });

        const buffer = await data.toBuffer();
        const wrapper = await wrapperService.uploadWrapper(buffer, data.filename, data.mimetype, req.user.userId);

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

        // Serve image directly
        reply.type(wrapper.mimeType).send(wrapper.data);
    } catch (error) {
        reply.code(404).send({ message: 'Wrapper not found' });
    }
};
