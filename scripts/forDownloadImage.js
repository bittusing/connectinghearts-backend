const path = require('path');
const fs = require('fs').promises;
const { s3Download, s3ListAllKeys } = require('../helper_functions/s3Helper');

const bucketName = 'srcmprofilesconnectinghearts';

// Since images are in ROOT of bucket
const fileFolderKey = "";  

const localDownloadDir = path.join(__dirname, '..', 'upload', 'srcmprofilesconnectinghearts');

// Ensure directory exists
async function ensureDownloadDir() {
  await fs.mkdir(localDownloadDir, { recursive: true });
}

// Main function
async function downloadImages() {
  await ensureDownloadDir();

  const imageKeys = await s3ListAllKeys(bucketName, fileFolderKey);

  if (!imageKeys.length) {
    console.log(`No objects found in bucket: ${bucketName}`);
    return;
  }

  for (const key of imageKeys) {
    try {
      console.log(`Downloading: ${key}`);

      const object = await s3Download(key, bucketName);

      if (!object || !object.Body) {
        console.warn(`Skipping ${key}: empty or null object`);
        continue;
      }

      const fileName = path.basename(key);
      const targetPath = path.join(localDownloadDir, fileName);

      // Convert S3 stream to buffer
      const chunks = [];
      for await (const chunk of object.Body) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);

      await fs.writeFile(targetPath, buffer);

      console.log(`✔ Saved: ${fileName} to ${targetPath}`);
      
    } catch (error) {
      console.error(`❌ Failed to download ${key}: ${error.message}`);
    }
  }
}

downloadImages().catch(err => {
  console.error("Download script failed:", err.message);
  process.exitCode = 1;
});
