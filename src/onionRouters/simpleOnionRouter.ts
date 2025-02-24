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

  const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString();
  const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();

  try {
    await axios.post(`http://localhost:${REGISTRY_PORT}/registerNode`, {
      nodeId,
      pubKey: publicKeyPem,
    });
    console.log(` Node ${nodeId} registered successfully.`);
  } catch (error: any) {
    console.error(` Error registering node ${nodeId}:`, error?.message || "Unknown error");
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
    res.json({ result: privateKeyPem });
  });

  const port = BASE_ONION_ROUTER_PORT + nodeId;

  const server = onionRouter.listen(port, () => {
    console.log(`Onion Router ${nodeId} is listening on port ${port}`);
  });

  return server;
}
