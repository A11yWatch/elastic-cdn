import { join } from "path";
import { AWS_S3_ENABLED } from "../../config";
import { getAWSFile } from "./aws";

export const downloadScript = ({ req, res }) => {
  const url = `scripts/${req.params.domain}/${req.params.cdnPath}`;
  res.set("Content-Disposition", `attachment; filename=${req.params.cdnPath}`);
  try {
    if (!AWS_S3_ENABLED) {
      res.download(join(`${__dirname}/../../${url}`));
    } else {
      getAWSFile(url, res);
    }
  } catch (e) {
    console.log(e, { type: "error" });
    res.send(false);
  }
};
