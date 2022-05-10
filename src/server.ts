import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import {
  getFile,
  downloadScript,
  DOWNLOAD_SCRIPT,
  GET_SCRIPT,
} from "./core/api";
import { PORT } from "./config";
import { startGRPC } from "./proto/init";

function initApp() {
  const app = express();

  app
    .use(cors())
    .use(bodyParser.urlencoded({ limit: "200mb", extended: true }))
    // rename cdn path
    .get(GET_SCRIPT, (req, res) => getFile({ req, res }, "scripts"))
    .get(DOWNLOAD_SCRIPT, (req, res) => downloadScript({ req, res }))
    .get("/_internal_/health/", (_req, res) => {
      res.json({ status: "healthy" });
    });

  const server = app.listen(PORT, async function () {
    try {
      console.log(`server listening on port ${this.address().port}!`);
      await startGRPC();
    } catch (e) {
      console.error(e);
    }
  });

  return server;
}

const server = initApp();

export const killServer = () => {
  return new Promise((resolve) => {
    server.close(() => {
      resolve(console.log("HTTP server closed"));
    });
  });
};

export { initApp, server };
