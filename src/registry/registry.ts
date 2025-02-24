import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { REGISTRY_PORT } from "../config";

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
    const { nodeId, pubKey } = req.body;

    if (!nodeId || !pubKey) {
      return res.status(400).json({ error: "Missing nodeId or pubKey" });
    }

    // Vérifier si le nœud est déjà enregistré
    if (nodesRegistry.find((node) => node.nodeId === nodeId)) {
      return res.status(400).json({ error: "Node already registered" });
    }

    nodesRegistry.push({ nodeId, pubKey });
    console.log(`Node ${nodeId} registered in the registry.`);

    return res.json({ success: true });
  });

  _registry.get("/getNodeRegistry", (req: Request, res: Response) => {
    res.json({ nodes: nodesRegistry });
  });

  const server = _registry.listen(REGISTRY_PORT, () => {
    console.log(`Registry is listening on port ${REGISTRY_PORT}`);
  });

  return server;
}
