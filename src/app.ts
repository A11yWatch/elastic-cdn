/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { corsOptionsDelegate } from "./config";

const app = express();

app.use(cors(corsOptionsDelegate));
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));

export { app };
