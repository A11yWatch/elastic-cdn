import request from "supertest";
import { server, killServer } from "../src/server";
import { killClient } from "../src/proto/website-client";
import { killServer as killGrpcServer } from "../src/proto/website-server";

afterAll(async () => {
  await killServer();
  await killClient();
  await killGrpcServer();
});

test("health renders properly", async () => {
  const res = await request(server).get("/_internal_/health/");
  return expect(res.status).toBe(200);
});
