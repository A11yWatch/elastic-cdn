import { createWriteStream } from "fs";
import { minify } from "@swc/core";
import { directoryExist } from "../../utils";
import { uploadToS3 } from "./aws";
import { AWS_S3_ENABLED } from "../../config/config";

const storeScriptLocal = async (params) => {
  const { scriptBuffer, cdnSourceStripped, domain } = params;

  if (cdnSourceStripped && scriptBuffer) {
    const srcPath = `src/scripts/${domain}/${cdnSourceStripped}`;
    const cdnFileName = `${srcPath}.js`;
    const cdnFileNameMin = `${srcPath}.min.js`;
    const dirExist = directoryExist(cdnFileName);

    if (dirExist) {
      const writeStream = createWriteStream(cdnFileName);
      const writeStreamMinified = createWriteStream(cdnFileNameMin);
      const newScriptBuffer = Buffer.from(scriptBuffer);
      // MOVE MINIFY TO QUEUE
      const output = await minify(scriptBuffer, { mangle: false });

      const { code } = output;

      const minBuffer = Buffer.from(code);

      writeStream.write(newScriptBuffer, "base64");
      writeStreamMinified.write(minBuffer, "base64");

      writeStream.end();
      writeStreamMinified.end();
    }
  }
};

const storeScriptAws = async (params) => {
  const { scriptBuffer, cdnSourceStripped, domain } = params;

  if (cdnSourceStripped && scriptBuffer) {
    const awsPath = `scripts/${domain}/${cdnSourceStripped}`;

    const newScriptBuffer = Buffer.from(scriptBuffer);
    // MOVE MINIFY TO QUEUE
    const output = await minify(scriptBuffer, { mangle: false });
    const { code } = output;
    const minBuffer = Buffer.from(code);

    await uploadToS3(newScriptBuffer, `${awsPath}.js`, "text/javascript");
    await uploadToS3(minBuffer, `${awsPath}.min.js`, "text/javascript");
  }
};

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
