import { createWriteStream } from "fs";
import { minify } from "@swc/core";

import { directoryExist } from "../../utils/directory";
import { uploadToS3 } from "../../utils/aws";

import { AWS_S3_ENABLED } from "../../config/config";

const buildPath = ([domain, src]: [string, string]) =>
  `scripts/${domain}/${src}`;

// store script locally
const storeScriptLocal = async (params) => {
  const { scriptBuffer, cdnSourceStripped, domain } = params;

  if (cdnSourceStripped && scriptBuffer) {
    const srcPath = buildPath([domain, cdnSourceStripped]);
    const cdnFileName = `${srcPath}.js`;

    // make sure base directory exist
    if (directoryExist(cdnFileName)) {
      const newScriptBuffer = Buffer.from(scriptBuffer); // non minified

      // MOVE MINIFY TO QUEUE
      const output = await minify(scriptBuffer, { mangle: false });

      const { code } = output;

      const minBuffer = Buffer.from(code); // minified

      // store file
      const writeStream = createWriteStream(cdnFileName);
      const writeStreamMinified = createWriteStream(`${srcPath}.min.js`);

      writeStream.write(newScriptBuffer, "base64");
      writeStreamMinified.write(minBuffer, "base64");

      writeStream.end();
      writeStreamMinified.end();
    }
  }
};

// store script to aws
const storeScriptAws = async (params) => {
  const { scriptBuffer, cdnSourceStripped, domain } = params;

  if (cdnSourceStripped && scriptBuffer) {
    const awsPath = buildPath([domain, cdnSourceStripped]);

    const newScriptBuffer = Buffer.from(scriptBuffer);

    // MOVE MINIFY TO QUEUE
    const output = await minify(scriptBuffer, { mangle: false });
    const { code } = output;

    const minBuffer = Buffer.from(code);

    await uploadToS3(newScriptBuffer, `${awsPath}.js`, "text/javascript");
    await uploadToS3(minBuffer, `${awsPath}.min.js`, "text/javascript");
  }
};

// add script to aws or local
export const addScriptSource = async (body) => {
  try {
    if (!AWS_S3_ENABLED) {
      await storeScriptLocal(body);
    } else {
      await storeScriptAws(body);
    }
  } catch (e) {
    console.log(e);
  }
};
