import axios from "axios";
import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { BASE_ONION_ROUTER_PORT, REGISTRY_PORT } from "../config";
import crypto from "crypto";

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  let lastEncryptedMessage: string | null = null;
  let lastDecryptedMessage: string | null = null;
  let lastDestination: number | null = null;

  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

  // Encodage des clés en base64 pour éviter les problèmes d'encodage
  const publicKeyBase64 = Buffer.from(
      publicKey.export({ type: "spki", format: "pem" }).toString()
  ).toString("base64");

  const privateKeyBase64 = Buffer.from(
      privateKey.export({ type: "pkcs8", format: "pem" }).toString()
  ).toString("base64");

  async function registerNode() {
    try {
      await axios.post(`http://localhost:${REGISTRY_PORT}/registerNode`, {
        nodeId,
        pubKey: publicKeyBase64, // Utilisation de la clé encodée
      });
      console.log(`✅ Node ${nodeId} registered successfully.`);
    } catch (error: any) {
      console.error(`❌ Error registering node ${nodeId}:`, error?.message || "Unknown error");
    }
  }

  onionRouter.get("/status", (req: Request, res: Response) => {
    res.send("live");
  });

  onionRouter.get("/getLastReceivedEncryptedMessage", (req: Request, res: Response) => {
    res.json({ result: lastEncryptedMessage || null });
  });

  onionRouter.get("/getLastReceivedDecryptedMessage", (req: Request, res: Response) => {
    res.json({ result: lastDecryptedMessage || null });
  });

  onionRouter.get("/getLastMessageDestination", (req: Request, res: Response) => {
    res.json({ result: lastDestination || null });
  });

  onionRouter.get("/getPrivateKey", (req: Request, res: Response) => {
    res.json({ result: privateKeyBase64 }); // Clé privée en base64
  });

  const port = BASE_ONION_ROUTER_PORT + nodeId;

  const startServer = () => {
    const server = onionRouter.listen(port, async () => {
      console.log(`✅ Onion Router ${nodeId} is listening on port ${port}`);
      await registerNode();
    });

    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.error(`⚠️ Port ${port} already in use. Retrying in 3 seconds...`);
        setTimeout(startServer, 3000);
      } else {
        console.error(`❌ Error starting Onion Router ${nodeId}:`, err.message);
      }
    });

    return server;
  };

  return startServer();
}
