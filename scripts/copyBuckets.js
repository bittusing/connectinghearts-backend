const { listKeys, downloadObject } = require("../helper_functions/s3HelperSource");
const { uploadObject } = require("../helper_functions/s3HelperTarget");

async function copyBucket(sourceBucket, targetBucket) {
  console.log(`\n🔄 Copying from ${sourceBucket} → ${targetBucket}\n`);

  const keys = await listKeys(sourceBucket);

  if (!keys.length) {
    console.log(`⚠ No files found in ${sourceBucket}`);
    return;
  }

  for (let key of keys) {
    try {
      console.log(`➡ Downloading: ${key}`);
      const data = await downloadObject(sourceBucket, key);

      const chunks = [];
      for await (const chunk of data.Body) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);

      await uploadObject(targetBucket, key, buffer, data.ContentType);

      console.log(`✔ Copied: ${key}`);
      
    } catch (err) {
      console.error(`❌ Error copying ${key}`, err.message);
    }
  }
}

// Run both bucket copies
(async () => {
  await copyBucket("profilepicsbucket", "profilepicsbucketss");
  await copyBucket("srcmprofilesconnectinghearts", "srcmprofilesconnectingheartss");

  console.log("\n🎉 Transfer Completed Successfully!\n");
})();
