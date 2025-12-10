import "fastify";

declare module "fastify" {
    interface FastifyRequest {
        user?: {
            address: string;
            nonce: string;
            userId: string;
        };

        query: {
            page?: string;
            limit?: string;
        };
    }
}
