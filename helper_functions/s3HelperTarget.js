const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3Target = new S3Client({
  region: '',
  credentials: {
    accessKeyId: '',
    secretAccessKey: '',
  },
});

async function uploadObject(bucket, key, body, contentType) {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType || "application/octet-stream",
  });

  await s3Target.send(cmd);
}

module.exports = { uploadObject };
