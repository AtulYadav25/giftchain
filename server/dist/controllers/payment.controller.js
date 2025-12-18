// import { FastifyReply, FastifyRequest } from 'fastify';
// import * as suiService from '../services/sui.service';
// import * as ikaService from '../services/ika.service';
// export const sendSui = async (req: FastifyRequest<{ Body: { recipient: string; amount: number } }>, reply: FastifyReply) => {
//     try {
//         const { recipient, amount } = req.body;
//         const result = await suiService.sendSui(recipient, amount);
//         reply.send(result);
//     } catch (error: any) {
//         reply.code(500).send({ message: error.message });
//     }
// };
// export const getSuiBalance = async (req: FastifyRequest, reply: FastifyReply) => {
//     const { address } = req.query as { address: string };
//     try {
//         const balance = await suiService.getBalance(address);
//         reply.send(balance);
//     } catch (error: any) {
//         reply.code(500).send({ message: error.message });
//     }
// };
// export const sendSol = async (req: FastifyRequest<{ Body: { recipient: string; amount: number } }>, reply: FastifyReply) => {
//     try {
//         const { recipient, amount } = req.body;
//         const result = await ikaService.sendSolViaMPC(recipient, amount);
//         reply.send(result);
//     } catch (error: any) {
//         reply.code(500).send({ message: error.message });
//     }
// };
// export const getSolBalance = async (req: FastifyRequest, reply: FastifyReply) => {
//     const { address } = req.query as { address: string };
//     try {
//         const balance = await ikaService.getSolBalance(address);
//         reply.send({ balance });
//     } catch (error: any) {
//         reply.code(500).send({ message: error.message });
//     }
// };
