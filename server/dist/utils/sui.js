"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = void 0;
const client_1 = require("@mysten/sui/client");
/** Get the client for the specified network. */
const getClient = (network) => {
    return new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)(network) });
};
exports.getClient = getClient;
