/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { join } from "path";
import { AWS_S3_ENABLED } from "../../config";
import { getAWSFile } from "./aws";

const getFile = ({ req, res }, pth?: string): void => {
  const url = `${pth || "screenshots"}/${req.params.domain}/${
    req.params.cdnPath
  }`;

  try {
    if (!AWS_S3_ENABLED) {
      res.sendFile(join(`${__dirname}/../../${url}`));
    } else {
      getAWSFile(url, res);
    }
  } catch (e) {
    console.log(e);
    res.send(false);
  }
};

export { getFile };
