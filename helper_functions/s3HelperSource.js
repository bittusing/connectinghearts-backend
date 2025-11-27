const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3Source = new S3Client({
  region: '',
  credentials: {
    accessKeyId: '',
    secretAccessKey: '',
  },
});

async function listKeys(bucket) {
  const cmd = new ListObjectsV2Command({ Bucket: bucket });
  const res = await s3Source.send(cmd);
  return res.Contents?.map(x => x.Key) || [];
}

async function downloadObject(bucket, key) {
  return await s3Source.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
}

module.exports = { listKeys, downloadObject };
