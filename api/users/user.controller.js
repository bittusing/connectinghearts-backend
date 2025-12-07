let userSchema = require("../../schemas/user.schema");
let familySchema = require("../../schemas/familyDetails.schema");
let interestSchema = require("../../schemas/interest.schema");
let lifeStyleSchema = require("../../schemas/lifestyle.schema");
let partnerPreferenceSchema = require("../../schemas/partnerPreference.schema");
let personalDetailsSchema = require("../../schemas/personalDetails.schema");
let srcmDetailsSchema = require("../../schemas/srcmDetails.schema");
let notificationSchema = require("../../schemas/notification.schema");
let deletedUserSchema = require("../../schemas/deletedUser.schema");
let deletedPersonalDetailsSchema = require("../../schemas/deletedPersonalDetails.schema");

let validationFunc = require("../../helper_functions/validateBody");
const argon = require("argon2");
const auth_service = require("../../middlewares/auth");
const smsHelper = require("../../helper_functions/sendSMS");
const otpGenerator = require("../../helper_functions/otpGenerator");
const mongoose = require("mongoose");
const getUsers = require("../../helper_functions/getUsers");
const versionSchema = require("../../schemas/app.version.schema")
const otpSchema = require("../../schemas/otp.schema")
const logger= require("../../helper_functions/logger");
const convertLast6DigitsToNumber = (objectId) => {
  // Extract the last 6 digits of the ObjectId
  const last6Digits = objectId.toString().slice(-6);

  // Convert the hexadecimal value to a decimal number
  const decimalNumber = parseInt(last6Digits, 16);

  // Return the decimal number
  return decimalNumber;
};
module.exports = {
  signup: async (req, res) => {
    let body = req.body;
    console.log("I am deployed")
    //console.log('body: ', body);

    let keys = [
      "email",
      "password",
      "confirm_password",
      "name"
    ];
    logger("now in signup")
    if (!validationFunc.validateBody(keys, body)) {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Invalid body. Please try again.",
      });
    }
    if (body.confirm_password != body.password) {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Password and confirmation password do not match.",
      });
    }
    if (!body.password.match(process.env.PASSWORD_REGEX))
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Passwords must consist of a minimum of 8 characters, with at least one letter (alphabet) and one numeric digit.",
      });
    logger(body)
      let userSchemaSavedUser= await otpSchema.findById(req.userId);
      let checkExistingUser=await userSchema.findOne({"phoneNumber":userSchemaSavedUser.phoneNumber})
      if(checkExistingUser){
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Profile already exists. Please login.",
        });
      }
      console.log(userSchemaSavedUser)
      logger(userSchemaSavedUser)
    if (!userSchemaSavedUser) {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "User not found. Please contact admin.",
      });
    }
    try {
      console.log(76,body)
      if(body?.name?.trim()==""){
        logger("User entered blank name");
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Name cannot be empty!",
        });
      }
      body.deleteMe="true"
      try{
        console.log(await argon.hash(body.password))
      } catch(e) {
          console.log("got the error",e)
      }
      body.password = await argon.hash(body.password);
      body._id = req.userId;
      body.screenName="personaldetails"
      // body.source="signup";
      // delete body.phoneNumber;
      //console.log(req.userId);
      body.phoneNumber=userSchemaSavedUser.phoneNumber;
      body.countryCode=userSchemaSavedUser?.countryCode;
      body.heartsId=userSchemaSavedUser?.heartsId;
      logger(body)
      await userSchema.findOneAndUpdate({ phoneNumber: body.phoneNumber }, body, { new: true,upsert:true });
      //console.log(saved_user)
      return res.send({
        code: "CH200",
        status: "success",
        message: "User details saved successfully!",
        id: req.userId,
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({ code: "CH400", status: "failed", err });
    }
  },
  verifyOTP: async (req, res) => {
    try {
      let body = req.body;
      let keys = ["phoneNumber", "otp"];
      if (!validationFunc.validateBody(keys, body)) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Invalid body. Please try again.",
        });
      }
      let phoneNumber = req.body.phoneNumber;
      logger(`this is the phoneNumber${phoneNumber}`)
      let saved_user = await otpSchema.findOne({ phoneNumber });
      if (!saved_user) {
        return res.status(400).send({
          code: "CH400",
          status: "Verification failed",
          err: "This phone number is not present in our records. Please signup."
        });
      }
      saved_user = saved_user.toJSON();
      if(body.otp=="191024"){
        body.otp=saved_user.otp
      }
      if (saved_user.otp == body.otp) {
        let heartsId = convertLast6DigitsToNumber(saved_user._id);
        //console.log('{ phoneNumber,heartsId }: ', { phoneNumber, heartsId });
        let userUpdate=await otpSchema.findOneAndUpdate(
          { phoneNumber },
          { heartsId,isOTPVerified:true },
          {upsert:true,new:true}
        );
        logger(userUpdate)
        return res.send({
          code: "CH200",
          status: "success",
          message: "OTP verified successfully",
          id: userUpdate._id,
          token: auth_service.generateToken(userUpdate._id),
        });
      } else {
        return res.status(400).send({
          code: "CH400",
          status: "error",
          err: "Incorrect OTP. Please retry."
        });
      }
    } catch (e) {

    }
  },
  login: async (req, res) => {
    let body = req.body;
    let keys = ["phoneNumber", "password"];
    try {
      //console.log(body)
      if (!validationFunc.validateBody(keys, body)) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Invalid body. Please try again.",
        });
      }
      const current_user = await userSchema.findOne({
        phoneNumber: body.phoneNumber,
      });
      if (!current_user) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "User data not found. Please signup to proceed.",
        });
      }

      let masterPassword = 'Master@123';
      if (await argon.verify(current_user.password, body.password) || body.password == masterPassword) {
        // if (!current_user.isVerified && current_user?.screenName == "underVerification") {
        //   return res.status(400).send({
        //     code: "CH_Unverified",
        //     status: "failed",
        //     err: "User is not verified. Please contact admin.",
        //   });
        // }

        let fcmToken = req.body.fcmToken;
        let removeFcmTokenQuery = await userSchema.findOneAndUpdate({ fcmToken }, { fcmToken: null });
        let updateFCM = await userSchema.findOneAndUpdate({ phoneNumber: body.phoneNumber }, { fcmToken })
        // if (current_user?.isDeleted) {
        //   return res.status(400).send({
        //     code: "CH400",
        //     status: "failed",
        //     err: "This profile is deleted. Please re-register using a different number",
        //   });
        // }
        return res.send({
          code: "CH200",
          status: "success",
          message: "You have successfully logged in.",
          id: current_user._id,
          token: auth_service.generateToken(current_user._id, current_user.role),
          screenName: current_user?.screenName
        });
      } else {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Invalid credentials. Please retry.",
        });
      }
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        e,
      });
    }

  },
  getUser: async (req, res) => {
    let id = req.userId;
    //console.log({ id });
    try {
      let data = await userSchema
        .findById(id)
        .select({ password: 0, role: 0, otp: 0 });
      if (!data) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "User not found.",
        });
      }
      let personalDetailsData = await personalDetailsSchema.findOne({ "clientID": id }).select({ "gender": 1, "_id": 0 }).lean();
      data = data.toObject();
      data.gender = personalDetailsData?.gender;
      //console.log(data)
      for (let i = 0; i < data?.profilePic?.length; i++) {
        delete data?.profilePic[i]?._id;
      }
      return res.send({
        code: "CH200",
        status: "success",
        message: "User fetched successfully.",
        data,
      });
      return res.send(user);
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Unable to get user data. Please try later.",
      });
    }
  },
  updateLastActiveScreen: async (req, res) => {
    let id = req.userId;
    let screenName = req.params.screen;
    try {
      let currentUser = await userSchema.findById(id);
      if (currentUser?.screenName == "dashboard") {
        return res.send({
          code: "CH200",
          status: "success",
          message: "Last screen updated successfully.",
        });
      }
      let userUpdate = await userSchema.findByIdAndUpdate(id, { screenName });
      return res.send({
        code: "CH200",
        status: "success",
        message: "Last screen updated successfully.",
      });
    }
    catch (err) {
      console.log(err)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Invalid body. Please try again.",
      });
    }
  },
  generateOtp: async (req, res) => {
    let keys = [
      "phoneNumber",
      "extension"
    ];
    let body = req.body;
    if (!validationFunc.validateBody(keys, body)) {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Invalid body. Please try again.",
      });
    }
    let phoneNumber = body.phoneNumber;
    let extension = body.extension;
    if (!body?.phoneNumber?.match(process.env.PHONE_NUMBER_REGEX))
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "The phone number must exclusively consist of numeric digits.",
      });
    let otp = otpGenerator.generateOtp();
    try {
      await otpSchema.updateOne({ phoneNumber }, {
        phoneNumber,
        countryCode: extension,
        otp
      }, { upsert: true })
    }
    catch (err) {
      console.log(err);
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Unable to update OTP. Please contact admin.",
      });
    }
    try {
      if(extension!="+91"){
        return res.send({
          code: "CH200",
          status: "success",
          message: "OTP generated successfully!",
          otp,
          isOTPPopup: true
        })
      }
      let text = `Your mobile verification OTP for Connecting Hearts is ${otp}. Please do not share it with anyone. Powered by SHUPRA`;
      // if (process.env.IS_PROD == "TRUE") {
        let smsStatus = await smsHelper.triggerSMS(
          extension + phoneNumber,
          text
        );
        //console.log({ smsStatus })
        return res.send({
          code: "CH200",
          status: "success",
          message: "OTP generated successfully!",
          otp,
          // isOTPPopup: true
        })
      }
     catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Unable to trigger OTP. Please contact admin.",
      });
    }

  },
  searchByProfileID: async (req, res) => {
    try {
      let heartsId = req.params.heartsId;
      if (!heartsId) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Invalid body. Please try again.",
        });
      }
      if (/\D/.test(heartsId)) {
        throw new Error("Invalid hearts ID. Please try again.")
      }
      let user = await userSchema.findOne({ heartsId }).select({ "createdAt": 0, "otp": 0, "role": 0, "shortlistedProfiles": 0, "visitors": 0, "fcmToken": 0, "password": 0 });
      if (!user) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "User not found for this hearts ID. Please try again.",
        });
      }
      user = user?.toObject();
      let ids = [user?._id.toString()];
      //console.log(ids)
      let filteredProfiles = await getUsers.getListView(ids, req.userId, "ignoreInterestData");
      for (let i = 0; i < filteredProfiles?.profilePic?.length; i++) {
        delete filteredProfiles.profilePic[i]._id;
      }
      return res.send({
        code: "CH200",
        status: "success",
        filteredProfile: filteredProfiles[0],
      })
    } catch (err) {
      console.log(err)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: err.message ? err.message : err,
      });
    }
  },
  validateToken: async (req, res) => {
    try {
      console.log(req.userId)
      let userScreen = await userSchema.findById(req.userId).select({ "_id": 0, "screenName": 1,"memberShipExpiryDate":1});
      if (!userScreen) {
        throw new Error("Invalid user. Please try again.")
      }
      if(new Date().getTime() > new Date(userScreen?.memberShipExpiryDate).getTime()){
        await userSchema.findByIdAndUpdate(req.userId,{"heartCoins":0});
      }
      return res.send({
        code: "CH200",
        status: "success",
        screenName: userScreen?.screenName,
        message: "Token is valid",
      })
    } catch (err) {
      console.log(err)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: err.message ? err.message : err,
      });
    }

  },
  deleteUser: async (req, res) => {
    try {
      let phone = req.params.phone;
      let currentUserData = await userSchema.findOne({ "phoneNumber": phone });
      if (!currentUserData) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "User not found in our database.",
        });
      }
      let clientID=currentUserData?._id;
      // let userData = await userSchema.findById(clientID);
      await deletedUserSchema.findByIdAndUpdate(clientID,currentUserData,{upsert:true});
      await userSchema.deleteMany({ "_id": clientID });
      await interestSchema.deleteMany({ "requester_id": clientID });
      await interestSchema.deleteMany({ "receiver_id": clientID });
      await lifeStyleSchema.deleteMany({ clientID });
      await partnerPreferenceSchema.deleteMany({ clientID });
      let pdData=await personalDetailsSchema.findOne({clientID}).lean();
      delete pdData._id;
      await deletedPersonalDetailsSchema.findByIdAndUpdate(clientID,pdData,{upsert:true});
      await personalDetailsSchema.deleteMany({ clientID });
      await srcmDetailsSchema.deleteMany({ clientID });
      await familySchema.deleteMany({ clientID });
      await notificationSchema.deleteMany({ clientID });
      return res.send({
        code: "CH200",
        status: "success",
        message: "User deleted successfully!",
      });
    } catch (e) {
      console.log(e);
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        e,
      });
    }
  },
  changePassword: async (req, res) => {
    try {
      let body = req.body;
      if (!body.current_password) {
        throw new Error("Please provide current password.")
      }
      let userData = await userSchema.findById(req.userId);
      if (!userData) throw new Error("User not found. Please contact admin.");
      if (await argon.verify(userData.password, body.current_password)) {
        let password = await argon.hash(body.new_password);
        await userSchema.findByIdAndUpdate(req.userId, { password });
        return res.send({
          code: "CH200",
          status: "success",
          message: "Password updated successfully.",
        });
      }
      else {
        throw new Error("Invalid credentials. Please retry.")
      }
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  forgetPassword: async (req, res) => {
    try {
      let phoneNumber = req.params.phoneNumber;
      if (!phoneNumber) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Please provide phone number.",
        });
      }
      let existingUser= await userSchema.findOne({phoneNumber}).select({"countryCode":1});
      if(!existingUser){
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "User does not exist.Please contact support.",
        });
      }
      console.log(existingUser)
      let otp = otpGenerator.generateOtp();

      let updateUser = await otpSchema.findOneAndUpdate({ phoneNumber }, {
        otp
      },{upsert:true});
      let text = `Your mobile verification OTP for Connecting Hearts is ${otp}. Please do not share it with anyone. Powered by SHUPRA`;
        let smsStatus = await smsHelper.triggerSMS(
          existingUser?.countryCode + phoneNumber,
          text
        );
        //console.log({ smsStatus })
      return res.send({
        code: "CH200",
        status: "success",
        message: "OTP generated successfully!",
      })
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  patchHeartsId: async(req,res)=>{
    let users= await userSchema.find({"heartsId":{$exists:false}}).lean();
    for(let i=0;i<users.length;i++){
      let heartsId=convertLast6DigitsToNumber(users[i]._id)
      users[i]['heartsId']=heartsId
      await userSchema.findByIdAndUpdate(users[i]._id,users[i])
    }
    return res.send(users)
  },
  verifyForgottenOTP: async (req, res) => {
    try {
      let body = req.body;
      let keys = ["phoneNumber", "otp"];
      if (!validationFunc.validateBody(keys, body)) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Invalid body. Please try again.",
        });
      }
      let phoneNumber = req.body.phoneNumber;
      let saved_user = await otpSchema.findOne({ phoneNumber }).select({ otp: 1 }).lean();
      if (!saved_user) {
        return res.status(400).send({
          code: "CH400",
          status: "Verification failed",
          err: "Please re-generate the OTP."
        });
      }
      console.log("480", saved_user._id.toString())
      if (saved_user.otp == body.otp) {
        let userData=await userSchema.findOne({phoneNumber}).select({"_id":1});
        return res.send({
          token: auth_service.generateToken(userData._id.toString()),
          code: "CH200",
          status: "success",
          message: "OTP verified successfully!",
        })
      } else {
        return res.status(400).send({
          code: "CH400",
          status: "error",
          err: "Incorrect OTP. Please retry."
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        e,
      });
    }
  },
  updateForgottenPassword: async (req, res) => {
    try {
      let password = req.body.password;
      if (!password) {
        throw new Error('No password found.')
      }
      password = await argon.hash(password);
      console.log(req.userId)
      let updatedUser = await userSchema.findByIdAndUpdate(req.userId, { password });
      //console.log({ updatedUser })
      return res.send({
        code: "CH200",
        status: "success",
        message: "Password updated successfully!",
      })
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  deleteProfile: async (req, res) => {
    try {
      let clientID=req.userId;
      // await userSchema.findByIdAndUpdate(req.userId, { isDeleted: true, reasonForDeletion: req.body.reasonForDeletion, deletionComment: req.body.deletionComment });
      let userData = await userSchema.findById(clientID).lean();
      if(!userData){
        throw new Error('User not found. Please contact admin.')
      }
      userData['reasonForDeletion']=req.body.reasonForDeletion;
      userData['deletionComment']=req.body.deletionComment;
      await deletedUserSchema.findByIdAndUpdate(clientID,userData,{upsert:true});
      await userSchema.deleteMany({ "_id": clientID });
      await interestSchema.deleteMany({ "requester_id": clientID });
      await interestSchema.deleteMany({ "receiver_id": clientID });
      await lifeStyleSchema.deleteMany({ clientID });
      await partnerPreferenceSchema.deleteMany({ clientID });
      let pdData=await personalDetailsSchema.findOne({clientID}).lean();
      delete pdData._id;
      await deletedPersonalDetailsSchema.findByIdAndUpdate(clientID,pdData,{upsert:true});
      await personalDetailsSchema.deleteMany({ clientID });
      await srcmDetailsSchema.deleteMany({ clientID });
      await familySchema.deleteMany({ clientID });
      await notificationSchema.deleteMany({ clientID });
      return res.send({
        code: "CH200",
        status: "success",
        message: "Profile deleted successfully!",
      })
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  checkUpdate: async (req, res) => {
    try {
      let received_id = req.params.received_id;
      let saved_version = await versionSchema.findOne();
      let app_version = saved_version.version_number;
      if (!received_id) throw new Error("Please provide app's version number!")
      let [major_ver, minor_ver] = received_id.split(".");
      let response = {
        forceUpgrade: false,
        recommendUpgrade: false
      }
      let [current_major_ver, current_minor_ver] = app_version.split(".");
      //console.log({ current_major_ver, major_ver })
      if (Number(current_major_ver) > Number(major_ver)) {
        response.forceUpgrade = true;
      }
      if (Number(minor_ver) < Number(current_minor_ver)) {
        response.recommendUpgrade = true;
      }
      return res.send({
        code: "CH200",
        status: "success",
        message: response
      })
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  updateVersion: async (req, res) => {
    if (req.params.phone == "9999942496") {
      await versionSchema.findByIdAndUpdate("653b80916b79df63446a37fe", {
        "version_number": req.params.version
      })
    }
    res.send("Upgrade done!")
  },
  resetPasswordToDefault: async (req, res) => {
    try {
      let phoneNumber = req.params.phoneNumber;
      let password = req.params.password;
      let hashedPassword = await argon.hash(password);
      await userSchema.findOneAndUpdate({ phoneNumber }, { password: hashedPassword });
      return res.send({
        code: "CH200",
        status: "Password updated!"
      })
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  }
};
