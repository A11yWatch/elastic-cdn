/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import {
  addScript,
  addScreenshot,
  getRoot,
  getFile,
  downloadScript,
  ROOT,
  ADD_SCRIPT,
  ADD_SCREENSHOT,
  DOWNLOAD_SCRIPT,
  GET_SCRIPT,
  GET_SCREENSHOT,
} from "./core/api";
import { PORT } from "./config";

function initApp() {
  const app = express();

  app
    .set("trust proxy", true)
    .use(cors())
    .use(bodyParser.json({ limit: "500mb" }))
    .use(bodyParser.urlencoded({ limit: "500mb", extended: true }))
    .get(ROOT, getRoot)
    // rename cdn path
    .get(GET_SCRIPT, (req, res) => getFile({ req, res }, "scripts"))
    .get(GET_SCREENSHOT, (req, res) => getFile({ req, res }))
    .get(DOWNLOAD_SCRIPT, (req, res) => downloadScript({ req, res }))
    .post(ADD_SCRIPT, (req, res) => addScript({ req, res }))
    .post(ADD_SCREENSHOT, (req, res) => addScreenshot({ req, res }));

  const server = app.listen(PORT, function () {
    try {
      console.log(`server listening on port ${this.address().port}!`);
    } catch (e) {
      console.log(e, { type: "error" });
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

export { initApp, server as cdnServer };
