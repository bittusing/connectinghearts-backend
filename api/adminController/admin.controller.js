let userSchema = require("../../schemas/user.schema");
let validationFunc = require("../../helper_functions/validateBody");
const smsSender = require("../../helper_functions/sendEmail");
let memberShipListSchema = require("../../schemas/membershipDetails.schema");
let notificationService = require("../../helper_functions/notification");
const logger=require("../../helper_functions/logger")
function addMonthsToDate(monthsToAdd,date) {
  let userDate=date?date:new Date();
  const newDate = new Date(userDate);
  const currentMonth = newDate.getMonth();
  newDate.setMonth(currentMonth + monthsToAdd);
  return newDate;
}

module.exports = {
  getAllUsers: async (req, res) => {
    try {
      let type = req.params.type, query = {};
      // query["isDeleted"]={$exists:false}
      if (type == "unverified") {
        query['isVerified'] = false;
      }
      let users = await userSchema.aggregate([
        {
          $match: query
        },
        {
          $lookup: {
            from: 'personaldetails',
            localField: '_id',
            foreignField: 'clientID',
            as: 'personalDetails',
          },
        },
        {
          $lookup: {
            from: 'srcmdetails',
            localField: '_id',
            foreignField: 'clientID',
            as: 'srcmDetails',
          },
        }, {
          $project: {
            "blockList": 0,
            "countryCode": 0,
            "ignoreList": 0,
            "otpVerified": 0,
            "password": 0,
            "screenName": 0,
            "shortlistedProfiles": 0,
            "unlockedProfiles": 0,
            "visitors": 0,
            "fcmToken": 0,
            "personalDetails._id": 0,
            "personalDetails.clientID": 0,
            "personalDetails.createdAt": 0,
            "personalDetails.aboutMe": 0,
            "personalDetails.bodyType": 0,
            "personalDetails.thalassemia": 0,
            "personalDetails.hivPositive": 0,
            "personalDetails.interestedInSettlingAbroad": 0,
            "personalDetails.castNoBar": 0,
            "personalDetails.aboutMyCareer": 0,
            "personalDetails.rashi": 0,
            "personalDetails.nakshatra": 0,
            "personalDetails.countryOfBirth": 0,
            "personalDetails.stateOfBirth": 0,
            "personalDetails.cityOfBirth": 0,
            "personalDetails.timeOfBirth": 0,
            "personalDetails.haveChildren": 0,
            "personalDetails.stateOfBirth": 0,
            "srcmDetails.clientID": 0,
            "srcmDetails.createdAt": 0
          }
        },{
          $sort:{
            "createdAt":-1
          }
        }
      ])
      return res.send(users);
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Something went wrong. Please try again.",
        msg: e
      });
    }
  },
  verifyUser: async (req, res) => {
    let body = req.params;
    let keys = ["id"];

    if (!validationFunc.validateBody(keys, body)) {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Invalid body. Please try again.",
      });
    }
    try {
      let newbody={ isVerified: true, screenName: "dashboard" }
      logger(body)
      logger(newbody)
      let updatedUser = await userSchema.findByIdAndUpdate(
        body.id,
        {...newbody}
      );
      let text = `Congratulations ${updatedUser.name}!\n Your profile on Connecting Hearts has been successfully verified. Start exploring a world of potential matches and embark on your journey to finding true love. Wishing you a wonderful experience on our platform.\n \n \n Warm regards, \n Team Connecting Hearts.`;
      try {
        await smsSender.sendEmail(
          updatedUser.email,
          text
        );
      } catch (err) {
        console.log(err);
      }
      return res.send({
        code: "CH200",
        status: "success",
        message: "User verified successfully",
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Unable to verify user. Please try again.",
      });
    }
  },
  grantMembership: async (req, res) => {
    let body = req.body;
    let keys = ["membership_id", "user_id"];
    if (!validationFunc.validateBody(keys, body)) {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Invalid body. Please try again.",
      });
    }
    try {
      let memberShipPlanData = await memberShipListSchema.findById(body.membership_id);
      if (!memberShipPlanData) throw new Error("Membership data not found.");
      let existingMembership = await userSchema.findById(body.user_id).select({"_id":0,memberShipExpiryDate:1});
      await userSchema.findByIdAndUpdate(body.user_id, { "membershipStartDate": new Date(), "memberShipExpiryDate": addMonthsToDate(memberShipPlanData?.duration,existingMembership?.memberShipExpiryDate), planName: memberShipPlanData?.planName, $inc: { heartCoins: memberShipPlanData?.heartCoins },membership_id:body?.membership_id });      
      return res.send({
        code: "CH200",
        status: "success",
        message: "Membership granted successfully",
      })
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "something went wrong. Please try again.",
        e:e.message?e.message:e
      });
    }

  },
  sendBulkNotifications: async (req,res) =>{
    try{
      // let unpaidUsers = await userSchema.find({"heartCoins":0,"fcmToken":{$ne:null}}).select({"_id":1});
      let sixMonthsAgo = addMonthsToDate(-6);
      let query={"fcmToken": {$ne: null}, "heartCoins": {$lt: 21}};
      // let query={"phoneNumber":"9876543210"};
      let unpaidUsers = await userSchema.find(query).select({"_id":1});
      for(let i=0;i<unpaidUsers.length;i++){
        console.log(i+1 +"/"+unpaidUsers.length)
        await notificationService.sendNotificationToUser(unpaidUsers[i]._id,req.body.title,req.body.description);
      }
      return res.send("Notifications sent");

    } catch(e) {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "something went wrong. Please try again.",
        e:e.message?e.message:e
      });
    }

  },
  testEmail: async (req,res) =>{
    let body = req.body;
    let keys = ["email", "text"];
    if (!validationFunc.validateBody(keys, body)) {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Invalid body. Please try again.",
      });
    }
    try{
      let email = req.body.email;
      let text = req.body.text;
      await smsSender.sendEmail(email,text);
      return res.send({
        code: "CH200",
        status: "success",
        message: "Email sent successfully",
      });
    }
    catch(e){
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "something went wrong. Please try again.",
        e:e.message?e.message:e
      });
    }
  }
};
