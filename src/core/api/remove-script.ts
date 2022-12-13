import { rm } from "fs";
import { emptyS3Directory } from "../../utils/aws";
import { AWS_S3_ENABLED } from "../../config/config";

const buildPathBase = (domain: string) => `scripts/${domain}`;

// store script locally
const removeScriptLocal = (scriptPath) => {
  rm(scriptPath, { recursive: true }, (err) => {
    if (err) {
      console.log("error deleting directory", err);
    }
  });
};

// add script to aws or local
export const removeScriptSource = async (body) => {
  const { domain } = body;

  if (domain) {
    const scriptPath = buildPathBase(domain);

    try {
      if (!AWS_S3_ENABLED) {
        removeScriptLocal(scriptPath);
      } else {
        await emptyS3Directory(scriptPath);
      }
    } catch (e) {
      console.error(e);
    }
  }
};
