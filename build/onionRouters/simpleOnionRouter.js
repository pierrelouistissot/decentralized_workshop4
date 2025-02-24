"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleOnionRouter = void 0;
const axios_1 = __importDefault(require("axios"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const crypto_1 = __importDefault(require("crypto"));
async function simpleOnionRouter(nodeId) {
    const onionRouter = (0, express_1.default)();
    onionRouter.use(express_1.default.json());
    onionRouter.use(body_parser_1.default.json());
    // ✅ Stockage des derniers messages
    let lastEncryptedMessage = null;
    let lastDecryptedMessage = null;
    let lastDestination = null;
    // ✅ Génération des clés RSA
    const { publicKey, privateKey } = crypto_1.default.generateKeyPairSync("rsa", {
        modulusLength: 2048,
    });
    const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString();
    const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
    // ✅ Enregistrement du nœud auprès du registre
    try {
        await axios_1.default.post(`http://localhost:${config_1.REGISTRY_PORT}/registerNode`, {
            nodeId,
            pubKey: publicKeyPem,
        });
        console.log(`✅ Node ${nodeId} registered successfully.`);
    }
    catch (error) {
        console.error(`❌ Error registering node ${nodeId}:`, error?.message || "Unknown error");
    }
    // ✅ Routes GET
    onionRouter.get("/status", (req, res) => {
        res.send("live");
    });
    onionRouter.get("/getLastReceivedEncryptedMessage", (req, res) => {
        res.json({ result: lastEncryptedMessage || null });
    });
    onionRouter.get("/getLastReceivedDecryptedMessage", (req, res) => {
        res.json({ result: lastDecryptedMessage || null });
    });
    onionRouter.get("/getLastMessageDestination", (req, res) => {
        res.json({ result: lastDestination || null });
    });
    // ✅ Route pour récupérer la clé privée
    onionRouter.get("/getPrivateKey", (req, res) => {
        res.json({ result: privateKeyPem });
    });
    const port = config_1.BASE_ONION_ROUTER_PORT + nodeId;
    // ✅ Vérification si le port est déjà utilisé
    const server = onionRouter.listen(port, () => {
        console.log(`✅ Onion Router ${nodeId} is listening on port ${port}`);
    });
    return server;
}
exports.simpleOnionRouter = simpleOnionRouter;
