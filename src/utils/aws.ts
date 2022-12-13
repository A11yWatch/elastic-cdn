import { S3 } from "aws-sdk";
import { BUCKET_NAME } from "../config/config";

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
  return new Promise((resolve, reject) => {
    if (!s3bucket) {
      return resolve(null);
    }
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
  });
}

// clear s3 folder contents
export async function emptyS3Directory(prefix: string) {
  const listedObjects = await s3bucket
    .listObjectsV2({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    })
    .promise();

  if (listedObjects.Contents.length === 0) {
    return;
  }

  const deleteParams = {
    Bucket: BUCKET_NAME,
    Delete: { Objects: [] as any[] },
  };

  listedObjects.Contents.forEach((content) => {
    deleteParams.Delete.Objects.push({ Key: content.Key });
  });

  await s3bucket.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) {
    await emptyS3Directory(prefix);
  }
}
