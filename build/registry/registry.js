"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchRegistry = void 0;
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const config_1 = require("../config");
const nodesRegistry = [];
async function launchRegistry() {
    const _registry = (0, express_1.default)();
    _registry.use(express_1.default.json());
    _registry.use(body_parser_1.default.json());
    // ✅ Route /status
    _registry.get("/status", (req, res) => {
        res.send("live");
    });
    // ✅ Route pour enregistrer un nœud
    _registry.post("/registerNode", (req, res) => {
        const { nodeId, pubKey } = req.body;
        if (!nodeId || !pubKey) {
            return res.status(400).json({ error: "Missing nodeId or pubKey" });
        }
        // Vérifier si le nœud est déjà enregistré
        if (nodesRegistry.find((node) => node.nodeId === nodeId)) {
            return res.status(400).json({ error: "Node already registered" });
        }
        nodesRegistry.push({ nodeId, pubKey });
        console.log(`✅ Node ${nodeId} registered in the registry.`);
        return res.json({ success: true });
    });
    // ✅ Route pour récupérer la liste des nœuds enregistrés
    _registry.get("/getNodeRegistry", (req, res) => {
        res.json({ nodes: nodesRegistry });
    });
    const server = _registry.listen(config_1.REGISTRY_PORT, () => {
        console.log(`✅ Registry is listening on port ${config_1.REGISTRY_PORT}`);
    });
    return server;
}
exports.launchRegistry = launchRegistry;
