import { killServer as killGrpcServer } from "../src/proto/website-server";
import { startGRPC } from "../src/proto/init";

afterAll(async () => {
  await killGrpcServer();
});

test("health renders properly", async () => {
  await startGRPC();
});
