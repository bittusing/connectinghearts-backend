const mongoose = require('mongoose');
require('dotenv').config();

// Import schemas from schemas folder
const User = require('../schemas/user.schema');
const DeletedUser = require('../schemas/deletedUser.schema');

// Import S3 helper function
const { s3FileExists } = require('../helper_functions/s3Helper');

// Database connection
const MONGO_URI = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}`;

// S3 bucket name for profile pics
const PROFILE_PICS_BUCKET = process.env.PROFILE_PICS_BUCKET || 'profilepicsbucket';


// Function to clean profilePic array for a user
async function cleanUserProfilePics(user, isDeletedUser = false) {
  if (!user.profilePic || user.profilePic.length === 0) {
    return { cleaned: 0, total: 0, deletedFiles: [] };
  }

  const originalCount = user.profilePic.length;
  const validProfilePics = [];
  const deletedFiles = [];
  let cleanedCount = 0;

  for (const pic of user.profilePic) {
    if (pic.s3Link) {
      const exists = await s3FileExists(pic.s3Link, PROFILE_PICS_BUCKET);
      if (exists) {
        validProfilePics.push(pic);
      } else {
        deletedFiles.push({
          s3Link: pic.s3Link,
          id: pic.id,
          primary: pic.primary
        });
        console.log(`Removing non-existent S3 file: ${pic.s3Link} from user ${user.heartsId}`);
        cleanedCount++;
      }
    } else {
      // Keep pics without s3Link (might be placeholder or invalid data)
      validProfilePics.push(pic);
    }
  }

  if (cleanedCount > 0) {
    // Use direct MongoDB update to avoid validation issues
    try {
      await User.updateOne(
        { _id: user._id },
        { $set: { profilePic: validProfilePics } }
      );
      console.log(`Cleaned ${cleanedCount} invalid profile pics for user ${user.heartsId} (${isDeletedUser ? 'deleted' : 'active'})`);
    } catch (error) {
      console.error(`Failed to update user ${user.heartsId}:`, error.message);
      // Continue with other users even if one fails
    }
  }

  return { 
    cleaned: cleanedCount, 
    total: originalCount, 
    deletedFiles: deletedFiles,
    userId: user.heartsId,
    userType: isDeletedUser ? 'deleted' : 'active'
  };
}

// Function to clean profilePic array for deleted users using direct MongoDB operations
async function cleanDeletedUserProfilePics(user, isDeletedUser = false) {
  if (!user.profilePic || user.profilePic.length === 0) {
    return { cleaned: 0, total: 0, deletedFiles: [] };
  }

  const originalCount = user.profilePic.length;
  const validProfilePics = [];
  const deletedFiles = [];
  let cleanedCount = 0;

  for (const pic of user.profilePic) {
    if (pic.s3Link) {
      const exists = await s3FileExists(pic.s3Link, PROFILE_PICS_BUCKET);
      if (exists) {
        validProfilePics.push(pic);
      } else {
        deletedFiles.push({
          s3Link: pic.s3Link,
          id: pic.id,
          primary: pic.primary
        });
        console.log(`Removing non-existent S3 file: ${pic.s3Link} from deleted user ${user.heartsId}`);
        cleanedCount++;
      }
    } else {
      // Keep pics without s3Link (might be placeholder or invalid data)
      validProfilePics.push(pic);
    }
  }

  if (cleanedCount > 0) {
    // Use direct MongoDB update to avoid validation issues
    try {
      await DeletedUser.updateOne(
        { _id: user._id },
        { $set: { profilePic: validProfilePics } }
      );
      console.log(`Cleaned ${cleanedCount} invalid profile pics for deleted user ${user.heartsId}`);
    } catch (error) {
      console.error(`Failed to update deleted user ${user.heartsId}:`, error.message);
    }
  }

  return { 
    cleaned: cleanedCount, 
    total: originalCount, 
    deletedFiles: deletedFiles,
    userId: user.heartsId,
    userType: isDeletedUser ? 'deleted' : 'active'
  };
}

// Main cleanup function
async function cleanupProfilePics() {
  const summary = {
    activeUsers: {
      processed: 0,
      cleaned: 0,
      totalPics: 0,
      deletedFiles: [],
      usersWithCleanup: []
    },
    deletedUsers: {
      processed: 0,
      cleaned: 0,
      totalPics: 0,
      deletedFiles: [],
      usersWithCleanup: []
    },
    overall: {
      totalProcessed: 0,
      totalCleaned: 0,
      totalPics: 0
    }
  };

  try {
    console.log('Starting profile pics cleanup...');
    console.log(`Using S3 bucket: ${PROFILE_PICS_BUCKET}`);
    
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Process active users
    console.log('\nProcessing active users...');
    const activeUsers = await User.find({ profilePic: { $exists: true, $ne: [] } });
    console.log(`Found ${activeUsers.length} active users with profile pics`);
    console.log("activeUsers", activeUsers);
    for (let i = 0; i < activeUsers.length; i++) {
      const user = activeUsers[i];
      console.log(`Processing active user ${i + 1}/${activeUsers.length}: ${user.heartsId}`);
      const result = await cleanUserProfilePics(user, false);
      summary.activeUsers.processed++;
      summary.activeUsers.cleaned += result.cleaned;
      summary.activeUsers.totalPics += result.total;
      summary.activeUsers.deletedFiles.push(...result.deletedFiles);
      
      if (result.cleaned > 0) {
        summary.activeUsers.usersWithCleanup.push({
          userId: result.userId,
          cleaned: result.cleaned,
          deletedFiles: result.deletedFiles
        });
      }
    }

    // Process deleted users using direct MongoDB operations
    console.log('\nProcessing deleted users...');
    const deletedUsers = await DeletedUser.find({ profilePic: { $exists: true, $ne: [] } });
    console.log(`Found ${deletedUsers.length} deleted users with profile pics`);

    for (let i = 0; i < deletedUsers.length; i++) {
      const user = deletedUsers[i];
      console.log(`Processing deleted user ${i + 1}/${deletedUsers.length}: ${user.heartsId}`);
      const result = await cleanDeletedUserProfilePics(user, true);
      summary.deletedUsers.processed++;
      summary.deletedUsers.cleaned += result.cleaned;
      summary.deletedUsers.totalPics += result.total;
      summary.deletedUsers.deletedFiles.push(...result.deletedFiles);
      
      if (result.cleaned > 0) {
        summary.deletedUsers.usersWithCleanup.push({
          userId: result.userId,
          cleaned: result.cleaned,
          deletedFiles: result.deletedFiles
        });
      }
    }

    // Calculate overall totals
    summary.overall.totalProcessed = summary.activeUsers.processed + summary.deletedUsers.processed;
    summary.overall.totalCleaned = summary.activeUsers.cleaned + summary.deletedUsers.cleaned;
    summary.overall.totalPics = summary.activeUsers.totalPics + summary.deletedUsers.totalPics;

    // Display detailed summary
    console.log('\n=== DETAILED CLEANUP SUMMARY ===');
    console.log('\n📊 OVERALL STATISTICS:');
    console.log(`Total users processed: ${summary.overall.totalProcessed}`);
    console.log(`Total profile pics processed: ${summary.overall.totalPics}`);
    console.log(`Total invalid pics removed: ${summary.overall.totalCleaned}`);
    
    console.log('\n👥 ACTIVE USERS:');
    console.log(`Users processed: ${summary.activeUsers.processed}`);
    console.log(`Profile pics processed: ${summary.activeUsers.totalPics}`);
    console.log(`Invalid pics removed: ${summary.activeUsers.cleaned}`);
    console.log(`Users with cleanup: ${summary.activeUsers.usersWithCleanup.length}`);
    
    if (summary.activeUsers.usersWithCleanup.length > 0) {
      console.log('\nActive users with cleaned files:');
      summary.activeUsers.usersWithCleanup.forEach(user => {
        console.log(`  - User ${user.userId}: ${user.cleaned} files removed`);
        user.deletedFiles.forEach(file => {
          console.log(`    * ${file.s3Link} (ID: ${file.id}, Primary: ${file.primary})`);
        });
      });
    }

    console.log('\n🗑️ DELETED USERS:');
    console.log(`Users processed: ${summary.deletedUsers.processed}`);
    console.log(`Profile pics processed: ${summary.deletedUsers.totalPics}`);
    console.log(`Invalid pics removed: ${summary.deletedUsers.cleaned}`);
    console.log(`Users with cleanup: ${summary.deletedUsers.usersWithCleanup.length}`);
    
    if (summary.deletedUsers.usersWithCleanup.length > 0) {
      console.log('\nDeleted users with cleaned files:');
      summary.deletedUsers.usersWithCleanup.forEach(user => {
        console.log(`  - User ${user.userId}: ${user.cleaned} files removed`);
        user.deletedFiles.forEach(file => {
          console.log(`    * ${file.s3Link} (ID: ${file.id}, Primary: ${file.primary})`);
        });
      });
    }

    console.log('\n✅ Cleanup completed successfully!');
    return summary;

  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanupProfilePics()
    .then((summary) => {
      console.log('\n🎉 Script execution completed successfully!');
      console.log(`\n📋 FINAL SUMMARY:`);
      console.log(`- Total users processed: ${summary.overall.totalProcessed}`);
      console.log(`- Total files cleaned: ${summary.overall.totalCleaned}`);
      console.log(`- Active users with cleanup: ${summary.activeUsers.usersWithCleanup.length}`);
      console.log(`- Deleted users with cleanup: ${summary.deletedUsers.usersWithCleanup.length}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script execution failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupProfilePics, cleanUserProfilePics, cleanDeletedUserProfilePics };
