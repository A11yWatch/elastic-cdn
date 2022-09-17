import { S3 } from "aws-sdk";
import { BUCKET_NAME, AWS_S3_ENABLED } from "../config/config";

let s3bucket: S3;

if (BUCKET_NAME) {
  s3bucket = new S3({
    accessKeyId: process.env.IAM_USER_KEY,
    secretAccessKey: process.env.IAM_USER_SECRET,
  });
}

export function uploadToS3(
  Body: any, // file stream
  Key: string,
  ContentType?: string
) {
  if (!AWS_S3_ENABLED) {
    return;
  }
  return new Promise((resolve, reject) => {
    if (s3bucket) {
      s3bucket.upload(
        {
          Bucket: BUCKET_NAME,
          Key,
          Body,
          ACL: "public-read",
          ContentType,
          ContentDisposition:
            ContentType === "text/javascript" ? "inline" : undefined,
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        }
      );
    }
  });
}
