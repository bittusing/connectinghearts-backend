const AWS = require("aws-sdk");
// require('dotenv').config();
// AWS S3 configuration
const s3 = new AWS.S3({
  accessKeyId: '',
  secretAccessKey: '',
  region: '',
});
const s3Upload = async (file,bucketName) => {
  if(!file) throw new Error("No file found!");
  let fileName=new Date().getTime()+'-'+file.originalname.replace(/\s/g, '');
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  console.log({ params });
  try{
  const stored =await s3.upload(params).promise();
  return fileName;
  }
  catch(err){
    console.log(err)
    throw new Error(err.message);
  }
};
const s3Download = async (fileKey,bucketName) =>{
  const params = {
    Bucket: bucketName,
    Key: fileKey
  };
  try{
  return await s3.getObject(params).promise();
  }
  catch(err){
    return err
  }
}
const s3ListAllKeys = async (bucketName, prefix) => {
  const keys = [];
  let ContinuationToken = undefined;
  do {
    const params = { Bucket: bucketName };
    if (prefix) params.Prefix = prefix;
    if (ContinuationToken) params.ContinuationToken = ContinuationToken;
    const resp = await s3.listObjectsV2(params).promise();
    if (resp && resp.Contents) {
      for (const obj of resp.Contents) {
        if (obj && obj.Key) keys.push(obj.Key);
      }
    }
    ContinuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return keys;
};

const s3FileExists = async (s3Link, bucketName) => {
  if (!s3Link) return false;
  
  try {
    // Extract the key from the S3 link
    const key = s3Link.split('/').pop();
    
    const params = {
      Bucket: bucketName,
      Key: key
    };
    
    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    if (error.statusCode === 404) {
      return false;
    }
    console.error(`Error checking S3 file ${s3Link}:`, error.message);
    return false;
  }
}

module.exports = { s3Upload, s3Download, s3FileExists,s3ListAllKeys };


// const { S3Client, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
// const dotenv = require("dotenv");
// dotenv.config();

// const s3 = new S3Client({
//   region: '',
//   credentials: {
//     accessKeyId: '',
//     secretAccessKey: '',
//   },
// });

// // List all object keys from bucket
// async function s3ListAllKeys(bucketName, prefix = "") {
//   try {
//     const command = new ListObjectsV2Command({
//       Bucket: bucketName,
//       Prefix: prefix, // "" means root
//     });

//     const response = await s3.send(command);
//     const keys = response.Contents?.map(obj => obj.Key) || [];
//     return keys;

//   } catch (error) {
//     console.error("Error listing keys:", error.message);
//     return [];
//   }
// }

// // Download object from S3
// async function s3Download(key, bucketName) {
//   try {
//     const command = new GetObjectCommand({
//       Bucket: bucketName,
//       Key: key,
//     });

//     return await s3.send(command);
//   } catch (error) {
//     console.error(`Error downloading ${key}:`, error.message);
//     return null;
//   }
// }

// module.exports = { s3ListAllKeys, s3Download };
