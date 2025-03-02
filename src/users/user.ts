import axios from "axios";
import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { BASE_USER_PORT } from "../config";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  let lastReceivedMessage: string | null = null;
  let lastSentMessage: string | null = null;

  _user.get("/status", (req: Request, res: Response) => {
    res.send("live");
  });

  _user.get("/getLastReceivedMessage", (req: Request, res: Response) => {
    return res.json({ result: lastReceivedMessage || null });
  });

  _user.get("/getLastSentMessage", (req: Request, res: Response) => {
    return res.json({ result: lastSentMessage || null });
  });

  _user.post("/message", (req: Request, res: Response) => {
    const { message } = req.body as SendMessageBody;
    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }
    lastReceivedMessage = message;
    console.log(`📩 User ${userId} received message: ${message}`);
    return res.json({ success: true });
  });

  _user.post("/sendMessage", async (req: Request, res: Response) => {
    const { message, destinationUserId } = req.body as SendMessageBody;
    if (!message || destinationUserId === undefined) {
      return res.status(400).json({ error: "Missing message or destinationUserId" });
    }
    lastSentMessage = message;

    console.log(`📤 User ${userId} sent message to User ${destinationUserId}: ${message}`);

    try {
      const response = await axios.post(
          `http://localhost:${BASE_USER_PORT + destinationUserId}/message`,
          { message }
      );
      return res.json(response.data);
    } catch (error: any) {
      console.error(`❌ Failed to send message:`, error.message);
      return res.status(500).json({ error: "Failed to send message" });
    }
  });

  const port = BASE_USER_PORT + userId;

  const startServer = () => {
    const server = _user.listen(port, () => {
      console.log(`✅ User ${userId} is listening on port ${port}`);
    });

    server.on("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        console.error(`⚠️ Port ${port} already in use. Retrying in 3 seconds...`);
        setTimeout(startServer, 3000);
      } else {
        console.error(`❌ Error starting User ${userId}:`, err.message);
      }
    });

    return server;
  };

  return startServer();
}
