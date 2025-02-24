"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
async function user(userId) {
    const _user = (0, express_1.default)();
    _user.use(express_1.default.json());
    _user.use(body_parser_1.default.json());
    let lastReceivedMessage = null;
    let lastSentMessage = null;
    // ✅ Route /status
    _user.get("/status", (req, res) => {
        res.send("live");
    });
    // ✅ Route pour récupérer le dernier message reçu
    _user.get("/getLastReceivedMessage", (req, res) => {
        return res.json({ result: lastReceivedMessage || null });
    });
    // ✅ Route pour récupérer le dernier message envoyé
    _user.get("/getLastSentMessage", (req, res) => {
        return res.json({ result: lastSentMessage || null });
    });
    // ✅ Route pour recevoir un message
    _user.post("/message", (req, res) => {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: "Missing message" });
        }
        lastReceivedMessage = message;
        console.log(`📩 User ${userId} received message: ${message}`);
        return res.json({ success: true });
    });
    const port = config_1.BASE_USER_PORT + userId;
    console.log(`🟡 Tentative de démarrage de User ${userId} sur le port ${port}`);
    const server = _user.listen(port, () => {
        console.log(`✅ User ${userId} is listening on port ${port}`);
    });
    server.on("error", (err) => {
        console.error(`❌ Erreur au démarrage de User ${userId} :`, err.message);
    });
    return server;
}
exports.user = user;
