"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchNetwork = void 0;
const launchOnionRouters_1 = require("./onionRouters/launchOnionRouters");
const registry_1 = require("./registry/registry");
const launchUsers_1 = require("./users/launchUsers");
async function launchNetwork(nbNodes, nbUsers) {
    try {
        console.log("🚀 Starting network...");
        // Launch node registry
        const registry = await (0, registry_1.launchRegistry)();
        console.log("✅ Registry started");
        // Launch all nodes
        const onionServers = await (0, launchOnionRouters_1.launchOnionRouters)(nbNodes);
        console.log(`✅ ${nbNodes} Onion Routers started`);
        // Launch all users
        const userServers = await (0, launchUsers_1.launchUsers)(nbUsers);
        console.log(`✅ ${nbUsers} Users started`);
        console.log("🚀 Network started successfully!");
        return [registry, ...onionServers, ...userServers];
    }
    catch (err) {
        console.error("❌ Error launching network:", err);
        process.exit(1);
    }
}
exports.launchNetwork = launchNetwork;
// Start the network with 3 nodes and 2 users
launchNetwork(3, 2);
