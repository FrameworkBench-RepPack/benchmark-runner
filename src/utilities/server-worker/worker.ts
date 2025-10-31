import { parentPort, workerData } from "worker_threads";
import {
  MessageType,
  type WorkerData,
  type MessageStructures,
} from "./worker-types.ts";
import { serveSites } from "test-sites/serveSite.ts";

(async () => {
  const data: WorkerData = workerData;

  const server = await serveSites({
    site: data.framework,
    port: data.port,
  });

  const readyMessage: MessageStructures[typeof MessageType.Ready][0] = {
    type: MessageType.Ready,
    payload: {
      message: `Now serving the framework: ${data.framework}`,
    },
  };

  parentPort?.postMessage(readyMessage);

  parentPort?.on("message", async (message) => {
    if (message?.type === MessageType.Stop) {
      await server.close();
      process.exit(0);
    }
  });
})();
