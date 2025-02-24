import { launchOnionRouters } from "./onionRouters/launchOnionRouters";
import { launchRegistry } from "./registry/registry";
import { launchUsers } from "./users/launchUsers";

export async function launchNetwork(nbNodes: number, nbUsers: number) {
  try {
    console.log("Starting network...");

    // Launch node registry
    const registry = await launchRegistry();
    console.log("Registry started");

    // Launch all nodes
    const onionServers = await launchOnionRouters(nbNodes);
    console.log(` ${nbNodes} Onion Routers started`);

    // Launch all users
    const userServers = await launchUsers(nbUsers);
    console.log(` ${nbUsers} Users started`);

    console.log(" Network started successfully!");
    return [registry, ...onionServers, ...userServers];
  } catch (err) {
    console.error(" Error launching network:", err);
    process.exit(1);
  }
}

// Start the network with 3 nodes and 2 users
launchNetwork(3, 2);
