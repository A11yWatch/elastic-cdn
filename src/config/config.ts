export const DEV: boolean = process.env.NODE_ENV === "development";
// AWS
export const BUCKET_NAME: string = process.env.BUCKET_NAME;
export const AWS_S3_ENABLED: boolean = !DEV && !!BUCKET_NAME;
