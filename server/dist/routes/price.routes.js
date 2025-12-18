"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceRoutes = priceRoutes;
const price_controller_1 = require("../controllers/price.controller");
async function priceRoutes(app) {
    app.get('/sui', price_controller_1.getPrice);
}
