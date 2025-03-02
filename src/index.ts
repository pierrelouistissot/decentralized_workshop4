import { launchOnionRouters } from "./onionRouters/launchOnionRouters";
import { launchRegistry } from "./registry/registry";
import { launchUsers } from "./users/launchUsers";

export async function launchNetwork(nbNodes: number, nbUsers: number) {
  try {
    console.log("Starting network...");

    const registry = await launchRegistry();
    const onionServers = await launchOnionRouters(nbNodes);
    const userServers = await launchUsers(nbUsers);

    console.log("Network started successfully!");
    return [registry, ...onionServers, ...userServers];
  } catch (err) {
    console.error("Error launching network:", err);
    process.exit(1);
  }
}

launchNetwork(3, 2).then(() => console.log("Network initialized."));
