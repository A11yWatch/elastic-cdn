import { readFileSync, createWriteStream } from "fs";
import { directoryExist } from "../../utils";
import { uploadToS3 } from "./aws";

const createSS = ({ srcPath, cdnFileName, screenshot }: any): any => {
  try {
    if (screenshot && directoryExist(srcPath)) {
      const screenshotStream = createWriteStream(cdnFileName);
      screenshotStream.write(Buffer.from(screenshot));

      screenshotStream.on("finish", () => {
        uploadToS3(
          readFileSync(cdnFileName),
          `${srcPath.substring(4)}.png`,
          cdnFileName
        );
      });

      screenshotStream.end();
    }
  } catch (e) {
    console.log(e);
  }
};

export const addScreenshotSource = async (params) => {
  const { cdnSourceStripped, domain, screenshot, screenshotStill } = params;
  try {
    const srcPath = `src/screenshots/${domain}/${cdnSourceStripped}`;
    const cdnFileName = srcPath + ".png";
    createSS({
      cdnFileName,
      screenshot,
      srcPath,
    });
    createSS({
      cdnFileName: cdnFileName.replace(".png", "-still.png"),
      screenshot: screenshotStill,
      srcPath: `${srcPath}-still`,
    });
  } catch (e) {
    console.log(e);
  }
};

export const addScreenshot = ({ req, res }) => {
  setImmediate(async () => {
    await addScreenshotSource(req.body);
  });

  res.send(true);
};
