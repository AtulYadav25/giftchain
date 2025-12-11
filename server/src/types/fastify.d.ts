import "fastify";

declare module "fastify" {
    interface FastifyRequest {
        user: {
            address: string;
            nonce: string;
            userId: string;
        };

        query: {
            page?: string;
            limit?: string;
        };
    }

    interface FastifyReply {
        setCookie: any; // or more specific types if needed
    }
}
