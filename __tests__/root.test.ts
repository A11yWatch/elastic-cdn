import {
  killServer as killGrpcServer,
  createServer,
} from "../src/proto/website-server";

afterAll(async () => {
  await killGrpcServer();
});

test("health renders properly", async () => {
  await createServer();
});
