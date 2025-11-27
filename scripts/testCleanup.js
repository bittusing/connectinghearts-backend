const { s3FileExists } = require('../helper_functions/s3Helper');

// Test function to verify S3 file checking works
async function testS3FileCheck() {
  console.log('Testing S3 file existence check...');
  
  // Test with a non-existent file
  const testFile = 'non-existent-file.jpg';
  const bucketName = process.env.PROFILE_PICS_BUCKET || 'profilepicsbucket';
  const exists = await s3FileExists(testFile, bucketName);
  console.log(`File ${testFile} exists: ${exists}`);
  
  // Test with empty/null values
  const emptyResult = await s3FileExists('', bucketName);
  console.log(`Empty string exists: ${emptyResult}`);
  
  const nullResult = await s3FileExists(null, bucketName);
  console.log(`Null value exists: ${nullResult}`);
  
  console.log('S3 file check test completed');
}

// Run test if this script is executed directly
if (require.main === module) {
  testS3FileCheck()
    .then(() => {
      console.log('Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testS3FileCheck };
