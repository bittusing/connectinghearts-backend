let validationFunc = require("../../helper_functions/validateBody");
let interestSchema = require("../../schemas/interest.schema");
let userSchema = require("../../schemas/user.schema");
let personalDetailsSchema = require("../../schemas/personalDetails.schema");
let partnerPreferenceSchema = require("../../schemas/partnerPreference.schema");
// let familyDetailsSchema = require("../../schemas/familyDetails.schema");
// let srcmDetailsSchema = require("../../schemas/srcmDetails.schema");
let dateHelper = require("../../helper_functions/dateHelper");
// let userHelper = require("../../helper_functions/getUsers");
const mongoose = require("mongoose");
const getUsers = require("../../helper_functions/getUsers");
const notificationService = require("../../helper_functions/notification");
let addYearsToDate=(date, yearsToAdd)=> {
  const newDate = new Date(date);
  newDate.setFullYear(newDate.getFullYear() + yearsToAdd);
  return newDate;
}
module.exports = {
  sendInterest: async (req, res) => {
    let body = req.body;
    let keys = ["targetId"];
    if (!validationFunc.validateBody(keys, body)) {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Invalid body. Please try again.",
      });
    }
    //interestStatuses are accept, decline,
    let interestBody = {
      requester_id: req.userId,
      receiver_id: body.targetId,
      status: "new"
    };
    try {
      try {
        let targetData = await userSchema.findOne({
          _id: body.targetId,
        });
        if (!targetData) {
          return res.status(400).send({
            code: "CH400",
            status: "error",
            message: "Target user not found.",
          });
        }
      } catch (e) {
        console.log(e)
        return res.status(400).send({
          code: "CH400",
          status: "error",
          message: "Target user not found.",
        });
      }
      let storedInterestData = await interestSchema.findOne({
        requester_id: req.userId,
        receiver_id: body.targetId
      });
      if (storedInterestData) {
        return res.send({
          code: "CH200",
          status: "success",
          message: "Interest already sent.",
        });
      }
      let interestData = new interestSchema(interestBody);
      await interestData.save();
      await notificationService.sendNotificationToUser(body.targetId, "Interest received!", "You've received a new interest on your profile. Check it out now!");

      return res.send({
        code: "CH200",
        status: "success",
        message: "Interest sent successfully.",
      });
    } catch (err) {
      console.log(err);
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Unable to send interest. Please try later.",
        log: err,
      });
    }
  },
  getInterests: async (req, res) => {
    let id = req.userId;
    try {
      let interestsData = await interestSchema.find({
        receiver_id: new mongoose.Types.ObjectId(id),
        status:"new"
      }).lean();
      let ids = [];
      for (let i = 0; i < interestsData.length; i++) {
        ids.push(interestsData[i].requester_id);
      }
      //console.log({ids})
      let filteredProfiles = await getUsers.getListView(ids,req.userId);
      let notificationCount = await getUsers.getNotificationCount(filteredProfiles,req.userId,"interestReceived")

      // return res.send({interestsData,filteredProfiles})

      return res.send({
        code: "CH200",
        status: "success",
        message: "Interest fetched successfully.",
        filteredProfiles,
        notificationCount
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Unable to get interests. Please try later.",
      });
    }
  },
  unsendInterest: async (req, res) => {
    try{
      let requester_id = req.userId;
      let receiver_id = req.body.receiver_id;
      //console.log({ requester_id, receiver_id })
      let removeInterest = await interestSchema.findOneAndRemove({ requester_id, receiver_id });
      //console.log('{ requester_id, receiver_id }: ', { requester_id, receiver_id });
      return res.send({
        code: "CH200",
        status: "success",
        message: "Interest unsent successfully."
      });
    }
    catch(e){
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e?.message ? e?.message : e
      });
    }
  },
  updateInterest: async (req, res) => {
    let body = req.body;
    let keys = ["_id", "status"];
    if (!validationFunc.validateBody(keys, body)) {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Invalid body. Please try again.",
      });
    }
    let status = req.body.status;
    if (status != "accept" && status != "reject") {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Invalid status. Please try again.",
      });
    }
    try {
      //console.log("got this status", status)
      let updatedInterest = await interestSchema.findOneAndUpdate({requester_id:body._id, receiver_id: req.userId}, {
        status,
      });
      if(status=="accept"){
        await notificationService.sendNotificationToUser(body._id, "Interest accepted!", "An interest you sent has been accepted.");
      }
      else{
        await notificationService.sendNotificationToUser(body._id, "Interest declined!", "An interest you sent has been declined. Keep searching for your match!");
      }
      return res.send({
        code: "CH200",
        status: "success",
        message: status=="accept"?"Interest accepted successfully.":"Interest declined successfully."
      });
    } catch (e) {
      console.log(e);
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Unable to update interest status. Please try again.",
      });
    }
  },
  getDailyRecommendations: async (req, res) => {
    let personalDetails = {}, partnerPreference = {}, query_obj = {};
    try {
      let currentUserData = await userSchema.findById(req.userId);
      // return res.send(currentUserData)
      personalDetails = await personalDetailsSchema.findOne({ "clientID": req.userId });
      partnerPreference = await partnerPreferenceSchema.findOne({ "clientID": req.userId });
      if (!personalDetails) throw new Error("Unable to fetch personal details");
      if(currentUserData?.ignoreList?.length){
        query_obj["clientID"]={$nin:currentUserData?.ignoreList}
      }
      query_obj["gender"] = personalDetails.gender == 'M' ? 'F' : 'M';
      if (personalDetails?.maritalStatus == "nvm") {
        query_obj["maritalStatus"] = "nvm";
      }
      else {
        query_obj["maritalStatus"] = { $in: ["ann", "sep", "wid", "div", "pend"] }
      }
      // query_obj["dob"]={$lte:new Date(addYearsToDate(personalDetails?.dob,5)),
      //   $gte:new Date(addYearsToDate(personalDetails?.dob,-5))}
      // if (partnerPreference?.age?.min || partnerPreference?.age?.max) {
      //   query_obj["dob"] = { $gte: dateHelper.generateDOB(partnerPreference.age.max || 80), $lte: dateHelper.generateDOB(partnerPreference.age.min || 18) }
      // }
      if (partnerPreference?.cast?.length && partnerPreference?.cast[0]) {
        query_obj["cast"] = {$in: partnerPreference.cast}
      }
      if (partnerPreference?.country?.length && partnerPreference?.country[0]) {
        query_obj["country"] = {$in: partnerPreference.country}
      }
      if (partnerPreference?.education?.length && partnerPreference?.education[0] ) {
        query_obj["education.qualification"] = {$in:partnerPreference.education}
      }
      if (partnerPreference?.horoscope?.length && partnerPreference?.horoscope[0]) {
        query_obj["horoscope"] = {$in:partnerPreference.horoscope}
      }
      if (partnerPreference?.income?.min || partnerPreference?.income?.max) {
        query_obj["income"] = { $lte: partnerPreference.income.max || 14, $gte: partnerPreference.income.min || 0 }
      }
      if (partnerPreference?.occupation?.length && partnerPreference?.occupation[0]) {
        query_obj["occupation"] = {$in:partnerPreference.occupation}
      }
      if (partnerPreference?.manglik?.length && partnerPreference?.manglik[0]) {
        query_obj["manglik"] = {$in:partnerPreference.manglik}
      }
      if (partnerPreference?.maritalStatus?.length && partnerPreference?.maritalStatus[0]) {
        query_obj["maritalStatus"] = {$in:partnerPreference.maritalStatus}
      }
      if (partnerPreference?.motherTongue?.length && partnerPreference?.motherTongue[0]) {
        query_obj["motherTongue"] = {$in:partnerPreference.motherTongue}
      }
      if (partnerPreference?.religion?.length && partnerPreference?.religion[0]) {
        query_obj["religion"] = {$in:partnerPreference.religion}
      }
      if (partnerPreference?.residentialStatus?.length && partnerPreference?.residentialStatus[0]) {
        query_obj["residentialStatus"] = {$in:partnerPreference.residentialStatus}
      }
      if (partnerPreference?.height?.min || partnerPreference?.height?.max) {
        query_obj["height"] = { $lte: partnerPreference.height.max || 84, $gte: partnerPreference.height.min || 48 }
      }
      console.log(query_obj)
      let recommendedProfiles = await personalDetailsSchema.find(query_obj).select({ "clientID": 1, _id: 0 });
      if (!recommendedProfiles) {
        throw new Error('No profiles found. Please change your details in partner preference screen.');
      }
      let ids = [];
      for (let i = 0; i < recommendedProfiles.length; i++) {
        ids.push(recommendedProfiles[i].clientID);
      }
      let filteredProfiles = await getUsers.getListView(ids,req.userId);
      return res.send({
        code: "CH200",
        status: "success",
        message: "DR fetched successfully.",
        filteredProfiles
      });     
    }

    catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e?.message ? e?.message : e
      });
    }
  },
  sendNotifications: async (req, res) => {
    try {
      let trigger = await notificationService.sendNotificationToUser("64f0d38053a6d21b4fe6a223", "Request title", "REQUEST BODY");
      //console.log({ trigger })
    }
    catch (err) {
      console.log({ err });
    }
    return res.send("Executed");
  }
};
