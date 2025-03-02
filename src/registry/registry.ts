import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";
import http from "http";

export type Node = { nodeId: number; pubKey: string };

export type RegisterNodeBody = {
  nodeId: number;
  pubKey: string;
};

export type GetNodeRegistryBody = {
  nodes: Node[];
};

const nodesRegistry: Node[] = [];

export async function launchRegistry() {
  const _registry = express();
  _registry.use(express.json());
  _registry.use(bodyParser.json());

  _registry.get("/status", (req, res) => {
    res.send("live");
  });

  _registry.post("/registerNode", (req: Request, res: Response) => {
    const { nodeId, pubKey } = req.body as RegisterNodeBody;
    if (nodeId === undefined || !pubKey) {
      return res.status(400).json({ error: "Missing nodeId or pubKey" });
    }

    if (nodesRegistry.some((node) => node.nodeId === nodeId)) {
      return res.status(400).json({ error: "Node already registered" });
    }

    nodesRegistry.push({ nodeId, pubKey });
    console.log(`✅ Node ${nodeId} registered successfully.`);
    return res.json({ success: true });
  });

  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    const responseBody: GetNodeRegistryBody = { nodes: nodesRegistry };
    res.json(responseBody);
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`✅ Registry is listening on port ${REGISTRY_PORT}`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`⚠️ Port ${REGISTRY_PORT} is already in use. Retrying...`);
      setTimeout(() => launchRegistry(), 3000);
    } else {
      console.error(`❌ Error starting registry:`, err.message);
    }
  });

  return server;
}
