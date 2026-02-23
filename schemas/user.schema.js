const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  fcmToken: String,
  heartsId: {
    type: Number,
    required: true
  },
  source:{
    type:String
  },
  email: {
    type: String,
    required: true
  },
  alternateEmail: {
    type: String
  },
  password: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true
  },
  altMobileNumber: {
    type: String,
    required: true
  },
  landline: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'client'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  kycStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'verified', 'failed']
  },
  kycData: {
    type: Object,
    default: {}
  },
  // isDeleted: Boolean,
  deletionComment: String,
  reasonForDeletion: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  profilePic: [{
    s3Link: { type: String },
    id: { type: String },
    primary: Boolean
  }],
  description: {
    type: String
  },
  visitors: {
    type: Array
  },
  shortlistedProfiles: {
    type: Array
  },
  ignoreList: {
    type: Array
  },
  blockList: {
    type: Array
  },
  unlockedProfiles: {
    type: Array
  },
  screenName: {
    type: String
  },
  memberShipExpiryDate: {
    type: Date,
    default:null
  },
  heartCoins: {type:Number,default:0},
  planName: {
    type: String,
    default:""
  },
  membershipStartDate: {type:Date,
    default:null},
  membership_id: {type:mongoose.Schema.ObjectId,
    default:null}
});
userSchema.path('profilePic').default([]);
userSchema.path('visitors').default([]);
userSchema.path('shortlistedProfiles').default([]);
userSchema.path('ignoreList').default([]);
userSchema.path('blockList').default([]);

const User = mongoose.model('User', userSchema);
module.exports = User;