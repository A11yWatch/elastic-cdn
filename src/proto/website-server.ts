import { Server, ServerCredentials } from "@grpc/grpc-js";
import { GRPC_PORT, GRPC_HOST } from "../config/rpc";
import { getProto } from "./website";
import { addScriptSource } from "../core/api/add-script";

let server: Server; // gRPC server

export const createServer = async () => {
  const websiteProto = await getProto();
  const healthProto = await getProto("/health.proto");

  server = new Server();

  server.addService(healthProto.health.HealthCheck.service, {
    check: (_call, callback) => {
      callback(null, { healthy: true });
    },
  });
  server.addService(websiteProto.Cdn.service, {
    addScript: (call, callback) => {
      setImmediate(async () => {
        await addScriptSource(call.request);
      });
      callback(null, {});
    },
  });
  server.bindAsync(GRPC_HOST, ServerCredentials.createInsecure(), () => {
    server.start();
    console.log(`gRPC server running at http://127.0.0.1:${GRPC_PORT}`);
  });
};

export const killServer = async () => {
  const websiteProto = await getProto();
  const healthProto = await getProto("/health.proto");

  server.removeService(websiteProto.Cdn.service);
  server.removeService(healthProto.health.HealthCheck.service);
  server.forceShutdown();
};
