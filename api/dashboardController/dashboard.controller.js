let validationFunc = require("../../helper_functions/validateBody");
let interestSchema = require("../../schemas/interest.schema");
let userSchema = require("../../schemas/user.schema");
let countrySchema = require("../../schemas/country.schema");
let stateSchema = require("../../schemas/state.schema");
let citySchema = require("../../schemas/city.schema");
let memberShipListSchema = require("../../schemas/membershipDetails.schema");
let personalDetailsSchema = require("../../schemas/personalDetails.schema");
let lookupSchema = require("../../schemas/lookup.schema");
let notificationSchema = require("../../schemas/notification.schema");
let dateHelper = require("../../helper_functions/dateHelper");
const familySchema = require("../../schemas/familyDetails.schema");
const lifestyleSchema = require("../../schemas/lifestyle.schema");
const getUsers = require("../../helper_functions/getUsers")
const axios = require("axios");
const notificationService = require("../../helper_functions/notification");
const mongoose = require("mongoose");
const s3uploadHelper = require("../../helper_functions/s3Helper")
const reviewSchema = require("../../schemas/review.schema");
const paymentAuditSchema = require("../../schemas/payment.audit.schema");
const mongoUtilService = require("../../helper_functions/mongoUtils");
const argon = require("argon2");
const nameUpdateSchema = require("../../schemas/nameUpdate.schema");
const paymentService = require("../../services/payment/paymentService");

function addMonthsToDate(monthsToAdd, date) {
  // Clone the input date to avoid modifying it directly
  if (date && date < new Date()) {
    date = new Date();
  }
  let userDate = date ? date : new Date();
  const newDate = new Date(userDate);

  // Calculate the new month and year
  const currentMonth = newDate.getMonth();
  newDate.setMonth(currentMonth + monthsToAdd);

  return newDate;
}
function findValueFromLookup(id, name, data) {
  if (!data || !data[name] || !Array.isArray(data[name])) {
    return undefined;
  }
  let lkpDisplayValue = data[name].filter((each_lkp) => {
    return id == each_lkp.value;
  });
  return lkpDisplayValue[0]?.label;
}
function isWithin5YearsRange(currentUserDate, targetUserDate) {
  // Create Date objects for currentUserDate and targetUserDate
  const currentDate = new Date(currentUserDate);
  const targetDate = new Date(targetUserDate);

  // Calculate the date 5 years ago from currentDate
  const fiveYearsAgo = new Date(currentDate);
  fiveYearsAgo.setFullYear(currentDate.getFullYear() - 5);

  // Calculate the date 5 years from currentDate
  const fiveYearsFromNow = new Date(currentDate);
  fiveYearsFromNow.setFullYear(currentDate.getFullYear() + 5);

  // Check if targetDate is within the 5-year range
  return targetDate >= fiveYearsAgo && targetDate <= fiveYearsFromNow;
}
function formatDateToDDMMYYYY(date) {
  const d = new Date(date);

  // Extract day, month, and year components
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based, so add 1
  const year = d.getFullYear();

  // Combine components into "dd/mm/yyyy" format
  return `${day}/${month}/${year}`;
}
module.exports = {
  getAcceptanceData: async (req, res) => {
    try {
      //console.log(req.userId);
      let type = req.params.type
      if (!type) {
        throw new Error("No type specified.")
      }
      let query = {}, actor;
      if (type == "acceptedMe") {
        query = {
          requester_id: new mongoose.Types.ObjectId(req.userId),
          status: "accept"
        }
        actor = "receiver_id";
      }
      else if (type == "acceptedByMe") {
        query = {
          receiver_id: new mongoose.Types.ObjectId(req.userId),
          status: "accept"
        }
        //console.log(query)
        actor = "requester_id";
      }
      else {
        throw new Error("Invalid type specified.")
      }
      let acceptanceData = await interestSchema.find(query).lean();
      let ids = [];
      for (let i = 0; i < acceptanceData.length; i++) {
        ids.push(acceptanceData[i][actor]._id);
      }
      let filteredProfiles = await getUsers.getListView(ids, req.userId, "ignoreInterestData");
      let notificationCount = 0;
      if (type == "acceptedMe") {
        notificationCount = await getUsers.getNotificationCount(filteredProfiles, req.userId, "acceptedMe");
      }
      // for(let i=0;i<filteredProfiles.length;i++){
      //   for(let j=0;j<acceptanceData.length;j++){
      //     if(filteredProfiles[i].clientID==acceptanceData[j][actor]._id){
      //     }
      //   }
      // }
      return res.send({
        code: "CH200",
        status: "success",
        message: "Accepted profiles fetched successfully.",
        filteredProfiles,
        notificationCount
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e?.message ? e?.message : e
      });
    }
  },
  getJustJoined: async (req, res) => {
    try {
      let personalDetails = await personalDetailsSchema.findOne({ "clientID": req.userId });
      if (!personalDetails) throw new Error("Unable to fetch personal details");
      let query_obj = {};
      query_obj["gender"] = personalDetails.gender == 'M' ? 'F' : 'M';
      if (personalDetails?.maritalStatus == "nvm") {
        query_obj["maritalStatus"] = "nvm";
      }
      else {
        query_obj["maritalStatus"] = { $in: ["ann", "sep", "wid", "div", "pend"] }
      }
      let recommendedProfiles = await personalDetailsSchema.find(query_obj).select({ "clientID": 1, _id: 0 });
      if (!recommendedProfiles) {
        throw new Error('No profiles found. Please contact admin.');
      }
      let pd_ids = [];
      for (let i = 0; i < recommendedProfiles.length; i++) {
        pd_ids.push(recommendedProfiles[i].clientID);
      }
      const currentDate = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      let userProfiles = await userSchema.find({
        createdAt: { $gte: thirtyDaysAgo, $lt: currentDate }, "isVerified": true, _id: { $ne: req.userId, $in: pd_ids }
      }).lean().select({ _id: 1 });
      let ids = [];
      for (let i = 0; i < userProfiles.length; i++) {
        ids.push(userProfiles[i]._id);
      }
      let filteredProfiles = await getUsers.getListView(ids, req.userId, false, false, false, true);
      return res.send({
        code: "CH200",
        status: "success",
        message: "User fetched successfully.",
        filteredProfiles,
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Unable to get users. Please try later.",
      });
    }
  },
  visitProfile: async (req, res) => {
    let currentUserId = req.userId;
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
      if (mongoUtilService.isValidMongoId(currentUserId)) {
        let user = null;
        if (currentUserId == body.id) {
          user = await userSchema
            .findById(req.params.id).select({ password: 0, role: 0, otp: 0, visitors: 0 });
        }
        else {
          user = await userSchema
            .findByIdAndUpdate(req.params.id, {
              $addToSet: { visitors: currentUserId },
            })
            .select({ password: 0, role: 0, otp: 0, visitors: 0 });
        }

        //hit get detail view
        return res.send(user);
      }
      else {
        throw new Error('Invalid ID');
      }
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Error fetching user data. Please try again.",
      });
    }
  },
  shortListProfile: async (req, res) => {
    let id = req.userId;
    let body = req.params;
    let keys = ["id"];
    if (!validationFunc.validateBody(keys, body)) {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Invalid body. Please try again.",
      });
    }
    let shortlistedId = req.params.id;

    try {
      if (mongoUtilService.isValidMongoId(shortlistedId)) {
        let updateUser = await userSchema.findOneAndUpdate(
          { _id: id },
          { $addToSet: { shortlistedProfiles: shortlistedId } }
        );
        return res.send({
          code: "CH200",
          status: "success",
          message: "Profile shortlisted successfully.",
        });
      }
      else {
        throw new Error('');
      }
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Unable to shortlist. Please try later.",
      });
    }
  },
  unShortListProfile: async (req, res) => {
    try {
      let unShortlistedId = req.params.id;
      let updateUser = await userSchema.findOneAndUpdate(
        { _id: req.userId },
        { $pull: { shortlistedProfiles: unShortlistedId } }
      );
      return res.send({
        code: "CH200",
        status: "success",
        message: "Profile unshortlisted successfully.",
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Unable to unshortlist. Please try later.",
      });
    }
  },
  getMyShortListedProfiles: async (req, res) => {
    try {

      let userData = await userSchema.findById(req.userId).select({ "shortlistedProfiles": 1 });
      let ids = [];
      for (let i = 0; i < userData?.shortlistedProfiles?.length; i++) {
        ids.push(userData?.shortlistedProfiles[i]);
      }
      let shortlistedProfilesData = await getUsers.getListView(ids, req.userId);
      let notificationCount = await getUsers.getNotificationCount(shortlistedProfilesData, req.userId, "shortlistedProfile")
      return res.send({
        code: "CH200",
        status: "success",
        message: "Profiles fetched successfully.",
        shortlistedProfilesData,
        notificationCount
      });
    } catch (e) {
      console.log(e);
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Error fetching shortlist user data. Please try again.",
      });
    }
  },
  ignoreProfile: async (req, res) => {
    let currentUser = req.userId;
    let ignoredUser = req.params.id;
    try {
      if (mongoUtilService.isValidMongoId(ignoredUser)) {
        let user = await userSchema
          .findByIdAndUpdate(currentUser, {
            $addToSet: { ignoreList: ignoredUser },
          })
          .select({ password: 0, role: 0, otp: 0, visitors: 0 });
        return res.send({
          code: "CH200",
          status: "success",
          message: "User ignored successfully.",
        });
      }
      else {
        throw new Error("");
      }
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Error fetching user data. Please try again.",
      });
    }
  },
  blockProfile: async (req, res) => {
    let currentUser = req.userId;
    let blockedUser = req.params.id;
    try {
      if (mongoUtilService.isValidMongoId(blockedUser)) {
        let user = await userSchema
          .updateOne({ _id: currentUser }, {
            $addToSet: { blockList: blockedUser },
          })
          .select({ password: 0, role: 0, otp: 0, visitors: 0 });
        return res.send({
          code: "CH200",
          status: "success",
          message: "User blocked successfully.",
        });
      }
      else {
        throw new Error("");
      }
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Error fetching user data. Please try again.",
      });
    }
  },
  getAllIgnoredProfiles: async (req, res) => {
    try {
      let userData = await userSchema.findById(req.userId).select({ "ignoreList": 1 });
      let ids = [];
      for (let i = 0; i < userData?.ignoreList?.length; i++) {
        ids.push(userData?.ignoreList[i]);
      }
      let ignoreListData = await getUsers.getListView(ids, req.userId);
      let notificationCount = await getUsers.getNotificationCount(ignoreListData, req.userId, "ignoredProfile")
      return res.send({
        code: "CH200",
        status: "success",
        message: "Profiles fetched successfully.",
        ignoreListData,
        notificationCount
      });
    } catch (e) {
      console.log(e);
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Error fetching shortlist user data. Please try again.",
      });
    }
  },
  getMembershipList: async (req, res) => {
    try {
      let query = {};
      let userDetails = await userSchema.findById(req.userId).select({ _id: 0, countryCode: 1 });
      if (userDetails?.countryCode == "+91") {
        query["currency"] = "INR";
      } else {
        query["currency"] = "USD";
      }
      let membershipData = await memberShipListSchema.find(query);
      res.send(membershipData);
    } catch (e) {
      console.log(e);
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Error fetching membership list data. Please try again.",
      });
    }
  },
  buyMembership: async (req, res) => {
   // try {
      console.log("date in IST is:", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

      // Get membership plan and user data
      let membershipData = await memberShipListSchema.findById(req.params.id);
      let userData = await userSchema.findById(req.userId);
      
      // Validate membership data
      if (!membershipData) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Invalid membership plan selected.",
        });
      }
      
      // Validate user data
      if (!userData) {
        return res.status(401).send({
          code: "CH401",
          status: "failed",
          err: "User session invalid. Please login again.",
        });
      }

      // Generate unique order ID
      const orderId = new Date().getTime().toString();

      // Prepare order data for payment gateway
      const orderData = {
        amount: membershipData.membershipAmount,
        currency: membershipData.currency,
        orderId: orderId,
        customer: {
          customer_id: userData._id.toString(),
          customer_name: userData.name,
          customer_email: userData.email,
          customer_phone: membershipData.currency === "INR" 
            ? userData.phoneNumber 
            : userData.countryCode + userData.phoneNumber
        },
        metadata: {
          membership_id: membershipData._id.toString()
        },
        notes: {
          membership_id: membershipData._id.toString(),
          plan_name: membershipData.planName,
          user_id: userData._id.toString(),
          description: "Connecting hearts membership purchase"
        }
      };

      console.log('Creating payment order:', orderData);

      // Create order using payment service (Razorpay)
      const paymentResponse = await paymentService.createOrder(orderData);

      console.log('Payment order created:', paymentResponse);

      // Prepare response for frontend (web) and mobile app
      const response = {
        orderId: paymentResponse.orderId,
        sessionId: paymentResponse.sessionId,
        orderToken: paymentResponse.orderToken,
        // Web-specific: Razorpay key for frontend checkout
        keyId: paymentResponse.keyId,
        // Additional details
        amount: paymentResponse.amount,
        currency: paymentResponse.currency,
        paymentEnvironment: paymentResponse.paymentEnvironment,
        gateway: paymentResponse.gateway || 'RAZORPAY',
        // For mobile app compatibility
        receipt: paymentResponse.receipt || orderId
      };
      console.log("response", response);
      return res.send(response);
    // } catch (err) {
    //   console.log('Buy membership error:', err);
      
    //   let errorMessage = "Unable to create payment session. Please check your connection and try again.";
    //   let statusCode = 400;
      
    //   // Handle specific error types
    //   if (err?.statusCode === 401 || err?.response?.status === 401) {
    //     errorMessage = "Payment gateway authentication failed. Please contact support.";
    //     statusCode = 500;
    //   } else if (err?.statusCode === 400 || err?.response?.status === 400) {
    //     errorMessage = "Invalid payment request. Please check your membership selection.";
    //   } else if (err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND') {
    //     errorMessage = "Payment service unavailable. Please try again later.";
    //     statusCode = 503;
    //   } else if (err?.message) {
    //     errorMessage = err.message;
    //   } else if (err?.response?.data?.message) {
    //     errorMessage = err.response.data.message;
    //   } else if (typeof err === 'string') {
    //     errorMessage = err;
    //   }
      
    //   return res.status(statusCode).send({
    //     code: `CH${statusCode}`,
    //     status: "failed",
    //     err: errorMessage,
    //   });
    // }
  },
  verifyPayment: async (req, res) => {
    try {
      let orderID = req.params.orderID;
      console.log('Verifying payment for order:', orderID, 'for user:', req.userId);
      console.log("date in IST is:", new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      
      // Validate user session
      if (!req.userId) {
        return res.status(401).send({
          code: "CH401",
          status: "failed",
          err: "User session invalid. Please login again.",
        });
      }
      
      // Validate order ID
      if (!orderID) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Order ID is required for payment verification.",
        });
      }
      
      // Verify payment using payment service (Razorpay)
      const verificationResponse = await paymentService.verifyPayment(orderID);
      
      console.log("Payment verification response:", verificationResponse);

      // Prepare audit object for database
      const gateway = paymentService.getCurrentGateway();
      const audit_obj = {
        gateway_type: gateway.getGatewayName(),
        gateway_order_id: verificationResponse.orderId,
        order_id: verificationResponse.receipt || orderID,
        order_amount: verificationResponse.orderAmount,
        order_currency: verificationResponse.orderCurrency,
        order_status: verificationResponse.orderStatus,
        payment_session_id: verificationResponse.orderId, // Razorpay uses order ID as session
        payment_details: verificationResponse.paymentDetails,
        raw_response: verificationResponse.rawResponse,
        notes: verificationResponse.notes || {},
        timeStamp: new Date()
      };

      // Save to payment audit
      await paymentAuditSchema.findByIdAndUpdate(req.userId, audit_obj, { upsert: true });

      // Check if payment is successful
      if (verificationResponse.orderStatus === 'PAID') {
        // Get membership ID from notes
        const membershipId = verificationResponse.notes?.membership_id;
        
        if (!membershipId) {
          throw new Error("Membership ID not found in payment details. Please contact admin.");
        }

        let memberShipPlanData = await memberShipListSchema.findById(membershipId);
        if (!memberShipPlanData) {
          throw new Error("Something went wrong. Please contact admin.");
        }

        // Get existing membership expiry date
        let existingMembership = await userSchema.findById(req.userId).select({ "_id": 0, memberShipExpiryDate: 1 });
        
        // Update user membership
        await userSchema.findByIdAndUpdate(
          req.userId, 
          { 
            "membershipStartDate": new Date(), 
            "memberShipExpiryDate": addMonthsToDate(memberShipPlanData?.duration, existingMembership?.memberShipExpiryDate), 
            planName: memberShipPlanData?.planName, 
            $inc: { heartCoins: memberShipPlanData?.heartCoins }, 
            membership_id: membershipId 
          }
        );

        return res.send({
          code: "CH200",
          status: "success",
          message: "Membership purchased successfully.",
          orderId: verificationResponse.orderId,
          paymentDetails: verificationResponse.paymentDetails
        });
      } else {
        console.log('Payment status:', verificationResponse.orderStatus);
        throw new Error(`Payment not completed. Status: ${verificationResponse.orderStatus}. Please try again.`);
      }
    }
    catch (err) {
      console.error('Payment verification error:', err);
      
      let errorMessage = "Payment verification failed. Please contact support if payment was deducted.";
      let statusCode = 400;
      
      // Handle specific error types
      if (err?.statusCode === 401 || err?.response?.status === 401) {
        errorMessage = "Payment gateway authentication failed during verification.";
        statusCode = 500;
      } else if (err?.statusCode === 404 || err?.response?.status === 404) {
        errorMessage = "Payment order not found. Please try again.";
        statusCode = 404;
      } else if (err?.code === 'ECONNREFUSED' || err?.code === 'ENOTFOUND') {
        errorMessage = "Payment verification service unavailable. Please try again later.";
        statusCode = 503;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      return res.status(statusCode).send({
        code: `CH${statusCode}`,
        status: "failed",
        err: errorMessage,
      });
    }
  },
  getProfileVisitors: async (req, res) => {
    try {
      let id = req.userId;
      let userData = await userSchema.findById(id).lean().select({ "_id": 0, "visitors": 1 });
      let ids = [];
      for (let i = 0; i < userData?.visitors?.length; i++) {
        ids.push(userData.visitors[i]);
      }
      console.log(ids)
      let filteredProfiles = await getUsers.getListView(ids, req.userId, "ignoreInterestData", false, false, true);
      return res.send(filteredProfiles);

    } catch (e) {
      console.log(e);
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Error fetching profile visitors. Please try again.",
      });
    }
  },
  searchProfile: async (req, res) => {
    try {
      let userId = req.userId, body = req.body, query_obj = {};
      let personalDetails = await personalDetailsSchema.findOne({ "clientID": userId });
      if (!personalDetails) {
        throw new Error("Personal details not found. Please update before searching.")
      }
      query_obj["gender"] = personalDetails.gender == 'M' ? 'F' : 'M';
      if (personalDetails?.maritalStatus == "nvm") {
        query_obj["maritalStatus"] = "nvm";
      }
      else {
        query_obj["maritalStatus"] = { $in: ["ann", "sep", "wid", "div", "pend"] }
      }
      if (body?.religion?.length) {
        query_obj["religion"] = { $in: body.religion };
      }
      if (body?.country?.length) {
        query_obj["country"] = { $in: body.country };
      }
      if (body?.state?.length) {
        query_obj["state"] = { $in: body.state };
      }
      if (body?.city?.length) {
        query_obj["city"] = { $in: body.city };
      }
      if (body?.motherTongue?.length) {
        query_obj["motherTongue"] = { $in: body.motherTongue };
      }
      if (body?.maritalStatus?.length) {
        query_obj["maritalStatus"] = { $in: body.maritalStatus };
      }
      if (body?.age?.min || body?.age?.max) {
        query_obj["dob"] = { $gte: dateHelper.generateDOB(body.age.max || 80), $lte: dateHelper.generateDOB(body.age.min || 18) }
      }
      if (body?.height?.min || body?.height?.max) {
        query_obj["height"] = { $lte: body.height.max || 84, $gte: body.height.min || 48 }
      }
      if (body?.income?.min || body?.income?.max) {
        query_obj["income"] = { $lte: body.income.max || 14, $gte: body.income.min || 0 }
      }
      let recommendedProfiles = await personalDetailsSchema.find(query_obj).select({ "clientID": 1, _id: 0 });
      if (!recommendedProfiles) {
        throw new Error('No profiles found');
      }
      let ids = [];
      for (let i = 0; i < recommendedProfiles.length; i++) {
        ids.push(recommendedProfiles[i].clientID);
      }
      let filteredProfiles = await getUsers.getListView(ids, req.userId, "visitors");
      return res.send({
        code: "CH200",
        status: "success",
        message: "Profiles fetched successfully.",
        filteredProfiles
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }

  },
  //old function
  getDetailView: async (req, res) => {
    try {
      let requester_id = req.userId, target_id = req.params.target_id, triggerNotification = true;
      let initUserData = await userSchema.findById(target_id).select({ "_id": 0, "visitors": 1 });
      if (initUserData?.visitors?.includes(requester_id)) {
        triggerNotification = false;
      }
      if (mongoUtilService.isValidMongoId(requester_id)) {
        let userData = null;
        if (target_id != requester_id) {
          userData = await userSchema.findByIdAndUpdate(target_id, {
            $addToSet: { visitors: requester_id }
          }, { new: true });
        }
        else {
          userData = await userSchema.findById(target_id);
        }
        if (!userData) throw new Error('Target user not found!');
        let familyData = await familySchema.findOne({ "clientID": target_id });
        let lifeStyleData = await lifestyleSchema.findOne({ "clientID": target_id });
        let targetUserPD = await personalDetailsSchema.findOne({ "clientID": target_id });
        let currentUserPD = await personalDetailsSchema.findOne({ "clientID": requester_id });
        let currentUserLifeStyle = await lifestyleSchema.findOne({ "clientID": requester_id });
        let requesterUserData = await userSchema.findById(requester_id);
        let isShortlisted = requesterUserData?.shortlistedProfiles?.indexOf(target_id) > -1
        // if (userData?.isDeleted) {
        //   return res.send({
        //     code: "CH200",
        //     status: "success",
        //     data: { isDeleted: true },
        //   });
        // }
        let result = {
          "miscellaneous": {
            "country": targetUserPD?.country,
            "state": targetUserPD?.state,
            "city": targetUserPD?.city,
            "gender": targetUserPD?.gender,
            "heartsId": userData?.heartsId,
            "profilePic": userData?.profilePic,
            "clientID": userData?._id,
            "isUnlocked": requesterUserData?.unlockedProfiles?.indexOf(target_id) > -1 ? true : false,
            "isMembershipActive": new Date().getTime() < new Date(requesterUserData?.memberShipExpiryDate).getTime(),
            isShortlisted
          },
          "basic": {
            "cast": targetUserPD?.cast,
            "height": targetUserPD?.height,
            "state": targetUserPD?.state
          },
          "critical": {
            "dob": targetUserPD?.dob,
            "maritalStatus": targetUserPD?.maritalStatus
          },
          "about": {
            "managedBy": targetUserPD?.managedBy,
            "description": userData?.description,
            "bodyType": targetUserPD?.bodyType,
            "thalassemia": targetUserPD?.thalassemia,
            "hivPositive": targetUserPD?.hivPositive,
            "disability": targetUserPD?.disability
          },
          "education": {
            "qualification": targetUserPD?.education?.qualification,
            "otherUGDegree": targetUserPD?.education?.otherUGDegree,
            "aboutEducation": targetUserPD?.education?.aboutEducation,
            "school": targetUserPD?.education?.school,
          },
          "career": {
            "aboutMyCareer": targetUserPD?.aboutMyCareer,
            "employed_in": targetUserPD?.employed_in,
            "occupation": targetUserPD?.occupation,
            "organisationName": targetUserPD?.organisationName,
            "interestedInSettlingAbroad": targetUserPD?.interestedInSettlingAbroad,
            "income": targetUserPD?.income
          },
          "family": {
            "familyStatus": familyData?.familyStatus,
            "familyValues": familyData?.familyValues,
            "familyType": familyData?.familyType,
            "familyIncome": familyData?.familyIncome,
            "fatherOccupation": familyData?.fatherOccupation,
            "motherOccupation": familyData?.motherOccupation,
            "brothers": familyData?.brothers,
            "marriedBrothers": familyData?.marriedBrothers,
            "sisters": familyData?.sisters,
            "marriedSisters": familyData?.marriedSisters,
            "gothra": familyData?.gothra,
            "livingWithParents": familyData?.livingWithParents,
            "familyBasedOutOf": familyData?.familyBasedOutOf,
            "aboutMyFamily": familyData?.aboutMyFamily,
          },
          "contact": {
            "alternateEmail": userData?.alternateEmail,
            "altMobileNumber": userData?.altMobileNumber,
            "landline": userData?.landline,
            "phoneNumber": requesterUserData?.unlockedProfiles?.indexOf(target_id) > -1 ? userData?.countryCode + userData?.phoneNumber : "",
            "email": requesterUserData?.unlockedProfiles?.indexOf(target_id) > -1 ? userData?.email : "",
            "name": requesterUserData?.unlockedProfiles?.indexOf(target_id) > -1 ? userData?.name : "",
          },
          "kundali": {
            "city": targetUserPD?.cityOfBirth,
            "country": targetUserPD?.countryOfBirth,
            "state": targetUserPD?.stateOfBirth,
            "tob": targetUserPD?.timeOfBirth,
            "manglik": targetUserPD?.manglik,
            "horoscope": targetUserPD?.horoscope,
            "rashi": targetUserPD?.rashi,
            "nakshatra": targetUserPD?.nakshatra,
          },
          "lifeStyleData": {
            "habits": lifeStyleData?.habits,
            "assets": lifeStyleData?.assets,
            "movies": lifeStyleData?.movies,
            "languages": lifeStyleData?.languages,
            "foodICook": lifeStyleData?.foodICook,
            "hobbies": lifeStyleData?.hobbies,
            "interest": lifeStyleData?.interest,
            "books": lifeStyleData?.books,
            "dress": lifeStyleData?.dress,
            "sports": lifeStyleData?.sports,
            "cuisine": lifeStyleData?.cuisine,
            "favRead": lifeStyleData?.favRead,
            "favTVShow": lifeStyleData?.favTVShow,
            "vacayDestination": lifeStyleData?.vacayDestination,
            "dietaryHabits": lifeStyleData?.dietaryHabits,
            "drinkingHabits": lifeStyleData?.drinkingHabits,
            "smokingHabits": lifeStyleData?.smokingHabits,
            "openToPets": lifeStyleData?.openToPets,
            "ownAHouse": lifeStyleData?.ownAHouse,
            "ownACar": lifeStyleData?.ownACar,
            "foodICook": lifeStyleData?.foodICook,
            "favMusic": lifeStyleData?.favMusic
          }
        }
        let match = [];
        // targetUserPD currentUserPD
        let lookupData = await lookupSchema.findOne().lean();
        if (currentUserPD && targetUserPD && (isWithin5YearsRange(currentUserPD.dob, targetUserPD.dob))) {
          match.push({ label: "Age", isMatched: true, value: formatDateToDDMMYYYY(currentUserPD?.dob) })
        }
        else {
          match.push({ label: "Age", isMatched: false, value: formatDateToDDMMYYYY(currentUserPD?.dob) })
        }
        if (currentUserPD?.maritalStatus == "nvm") {
          if (targetUserPD.maritalStatus == "nvm")
            match.push({ label: "Marital status", isMatched: true, value: "Never married" });
          else
            match.push({ label: "Marital status", isMatched: false, value: "Never married" });
        }
        else {
          if (targetUserPD?.maritalStatus != "nvm")
            match.push({ label: "Marital status", isMatched: true, value: findValueFromLookup(currentUserPD.maritalStatus, "maritalStatus", lookupData) || "Not filled" });
          else
            match.push({ label: "Marital status", isMatched: false, value: findValueFromLookup(currentUserPD.maritalStatus, "maritalStatus", lookupData) || "Not filled" });
        }
        if (currentUserPD && targetUserPD && currentUserPD.disability && targetUserPD.disability) {
          if (currentUserPD.disability == targetUserPD.disability) {
            match.push({ label: "Disability", isMatched: true, value: findValueFromLookup(currentUserPD.disability, "disability", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Disability", isMatched: false, value: findValueFromLookup(currentUserPD.disability, "disability", lookupData) || "Not filled" })
          }
        }
        // if (currentUserPD && targetUserPD && currentUserPD.religion && targetUserPD.religion) {
        if (currentUserPD.religion == targetUserPD.religion) {
          match.push({ label: "Religion", isMatched: true, value: findValueFromLookup(currentUserPD.religion, "religion", lookupData) || "Not filled" })
        }
        else {
          match.push({ label: "Religion", isMatched: false, value: findValueFromLookup(currentUserPD.religion, "religion", lookupData) || "Not filled" })
        }
        // }
        // if (currentUserPD && targetUserPD && currentUserPD.motherTongue && targetUserPD.motherTongue) {
        if (currentUserPD.motherTongue == targetUserPD.motherTongue) {
          match.push({ label: "Mother tongue", isMatched: true, value: findValueFromLookup(currentUserPD.motherTongue, "motherTongue", lookupData) || "Not filled" })
        }
        else {
          match.push({ label: "Mother tongue", isMatched: false, value: findValueFromLookup(currentUserPD.motherTongue, "motherTongue", lookupData) || "Not filled" })
        }
        // }
        if (currentUserLifeStyle && lifeStyleData && currentUserLifeStyle.smokingHabits && lifeStyleData.smokingHabits) {
          if (currentUserLifeStyle?.smokingHabits == lifeStyleData?.smokingHabits) {
            match.push({ label: "Smoking", isMatched: true, value: findValueFromLookup(currentUserLifeStyle?.smokingHabits, "smokingHabits", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Smoking", isMatched: false, value: findValueFromLookup(currentUserLifeStyle?.smokingHabits, "smokingHabits", lookupData) || "Not filled" })
          }
        }
        if (currentUserLifeStyle && lifeStyleData && currentUserLifeStyle.drinkingHabits && lifeStyleData.drinkingHabits) {
          if (currentUserLifeStyle?.drinkingHabits == lifeStyleData?.drinkingHabits) {
            match.push({ label: "Drinking", isMatched: true, value: findValueFromLookup(currentUserLifeStyle?.drinkingHabits, "drinkingHabits", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Drinking", isMatched: false, value: findValueFromLookup(currentUserLifeStyle?.drinkingHabits, "drinkingHabits", lookupData) || "Not filled" })
          }
        }
        if (currentUserPD?.manglik == "N/A") {
          if (targetUserPD?.manglik == "N/A") {
            match.push({ label: "Manglik", isMatched: true, value: findValueFromLookup(currentUserPD?.manglik, "manglik", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Manglik", isMatched: false, value: findValueFromLookup(currentUserPD?.manglik, "manglik", lookupData) || "Not filled" })
          }
        }
        else if (currentUserPD?.manglik == "non") {
          if (targetUserPD?.manglik == "non") {
            match.push({ label: "Manglik", isMatched: true, value: findValueFromLookup(currentUserPD?.manglik, "manglik", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Manglik", isMatched: false, value: findValueFromLookup(currentUserPD?.manglik, "manglik", lookupData) || "Not filled" })
          }
        }
        else {
          if (targetUserPD?.manglik == "ang" || targetUserPD?.manglik == "man") {
            match.push({ label: "Manglik", isMatched: true, value: findValueFromLookup(currentUserPD?.manglik, "manglik", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Manglik", isMatched: false, value: findValueFromLookup(currentUserPD?.manglik, "manglik", lookupData) || "Not filled" })
          }
        }
        if (currentUserPD.gender == "M") {
          let upperHeight = currentUserPD?.height + 2;
          let lowerHeight = 48;
          if (targetUserPD?.height >= lowerHeight && targetUserPD?.height <= upperHeight) {
            match.push({ label: "Height", isMatched: true, value: findValueFromLookup(currentUserPD?.height, "height", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Height", isMatched: false, value: findValueFromLookup(currentUserPD?.height, "height", lookupData) || "Not filled" })
          }
        }
        else {
          let lowerHeight = currentUserPD?.height - 2;
          let upperHeight = 84;
          if (targetUserPD?.height >= lowerHeight && targetUserPD?.height <= upperHeight) {
            match.push({ label: "Height", isMatched: true, value: findValueFromLookup(currentUserPD?.height, "height", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Height", isMatched: false, value: findValueFromLookup(currentUserPD?.height, "height", lookupData) || "Not filled" })
          }
        }
        if (currentUserPD.gender == "M") {
          let upperIncome = currentUserPD?.income + 2;
          let lowerIncome = 0;
          if (targetUserPD?.income >= lowerIncome && targetUserPD?.income <= upperIncome) {
            match.push({ label: "Income", isMatched: true, value: findValueFromLookup(currentUserPD?.income, "income", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Income", isMatched: false, value: findValueFromLookup(currentUserPD?.income, "income", lookupData) || "Not filled" })
          }
        }
        else {
          let lowerIncome = currentUserPD?.income - 2;
          let upperIncome = 14;
          if (targetUserPD?.income >= lowerIncome && targetUserPD?.income <= upperIncome) {
            match.push({ label: "Income", isMatched: true, value: findValueFromLookup(currentUserPD?.income, "income", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Income", isMatched: false, value: findValueFromLookup(currentUserPD?.income, "income", lookupData) || "Not filled" })
          }
        }
        let matchedKeys = match.filter((each_match) => { return each_match.isMatched });
        let matchPercentage = (matchedKeys.length / match.length) * 100;
        result.matchData = match;
        result.matchPercentage = matchPercentage.toFixed(0);
        console.log({ triggerNotification })
        if (triggerNotification)
          await notificationService.sendNotificationToUser(target_id, "Profile viewed!", "Someone visited your profile. Find out who's interested in you!");
        return res.send({
          code: "CH200",
          status: "success",
          data: result,
        });
      }
      else {
        throw new Error("Invalid requester ID");
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
  //new function
  getDetailView1: async (req, res) => {
    try {
      let requester_id = req.userId, target_id = req.params.target_id, triggerNotification = true;
      let initUserData = await userSchema.findById(target_id).select({ "_id": 0, "visitors": 1 });
      if (initUserData?.visitors?.includes(requester_id)) {
        triggerNotification = false;
      }
      if (mongoUtilService.isValidMongoId(requester_id)) {
        let userData = null;
        if (target_id != requester_id) {
          userData = await userSchema.findByIdAndUpdate(target_id, {
            $addToSet: { visitors: requester_id }
          }, { new: true });
        }
        else {
          userData = await userSchema.findById(target_id);
        }
        if (!userData) throw new Error('Target user not found!');
        let familyData = await familySchema.findOne({ "clientID": target_id });
        let lifeStyleData = await lifestyleSchema.findOne({ "clientID": target_id });
        let targetUserPD = await personalDetailsSchema.findOne({ "clientID": target_id });
        let currentUserPD = await personalDetailsSchema.findOne({ "clientID": requester_id });
        let currentUserLifeStyle = await lifestyleSchema.findOne({ "clientID": requester_id });
        let requesterUserData = await userSchema.findById(requester_id);
        let isShortlisted = requesterUserData?.shortlistedProfiles?.indexOf(target_id) > -1;
        let lookupData = await lookupSchema.findOne().lean();
        let countryData = await countrySchema.findOne({ "value": targetUserPD?.country }).lean();
        let stateData = await stateSchema.findOne({ country_id: targetUserPD?.country }).lean();
        let cityData = await citySchema.findOne({ state_id: targetUserPD?.state }).lean();
        let result = {
          "miscellaneous": {
            "country": countryData?.label || targetUserPD?.country,
            "state": stateData?.states.find((each_state) => each_state.value == targetUserPD?.state)?.label || targetUserPD?.state,
            "city": cityData?.cities.find((each_city) => each_city.value == targetUserPD?.city)?.label || targetUserPD?.city,
            "gender": targetUserPD?.gender=="M" ? "Male" : "Female",
            "heartsId": userData?.heartsId,
            "profilePic": userData?.profilePic,
            "clientID": userData?._id,
            "isUnlocked": requesterUserData?.unlockedProfiles?.indexOf(target_id) > -1,
            "isMembershipActive": new Date().getTime() < new Date(requesterUserData?.memberShipExpiryDate).getTime(),
            isShortlisted
          },
          "basic": {
            "cast": findValueFromLookup(targetUserPD?.cast, "casts", lookupData) || targetUserPD?.cast,
            "height": findValueFromLookup(targetUserPD?.height, "height", lookupData) || targetUserPD?.height,
            "state": stateData?.states.find((each_state) => each_state.value == targetUserPD?.state)?.label || targetUserPD?.state,
            "city": cityData?.cities.find((each_city) => each_city.value == targetUserPD?.city)?.label || targetUserPD?.city,
            "country": countryData?.label || targetUserPD?.country,
          },
          "critical": {
            "dob": formatDateToDDMMYYYY(targetUserPD?.dob),
            "maritalStatus": findValueFromLookup(targetUserPD?.maritalStatus, "maritalStatus", lookupData) || targetUserPD?.maritalStatus,
          },
          "about": {
            "managedBy": findValueFromLookup(targetUserPD?.managedBy, "managedBy", lookupData) || targetUserPD?.managedBy,
            "description": userData?.description,
            "bodyType": findValueFromLookup(targetUserPD?.bodyType, "bodyType", lookupData) || targetUserPD?.bodyType,
            "thalassemia": findValueFromLookup(targetUserPD?.thalassemia, "thalassemia", lookupData) || targetUserPD?.thalassemia,
            "hivPositive": targetUserPD?.hivPositive=="Y" ? "Yes" : targetUserPD?.hivPositive=="N" ? "No" : "Not filled",
            "disability": findValueFromLookup(targetUserPD?.disability, "disability", lookupData) || targetUserPD?.disability
          },
          "education": {
            "qualification": findValueFromLookup(targetUserPD?.education?.qualification, "qualification", lookupData) || targetUserPD?.education?.qualification,
            "otherUGDegree": findValueFromLookup(targetUserPD?.education?.otherUGDegree, "otherUGDegree", lookupData) || targetUserPD?.education?.otherUGDegree,
            "aboutEducation": targetUserPD?.education?.aboutEducation,
            "school": findValueFromLookup(targetUserPD?.education?.school, "school", lookupData) || targetUserPD?.education?.school,
          },
          "career": {
            "aboutMyCareer": targetUserPD?.aboutMyCareer,
            "employed_in": findValueFromLookup(targetUserPD?.employed_in, "employed_in", lookupData) || targetUserPD?.employed_in,
            "occupation": findValueFromLookup(targetUserPD?.occupation, "occupation", lookupData) || targetUserPD?.occupation,
            "organisationName": findValueFromLookup(targetUserPD?.organisationName, "organisationName", lookupData) || targetUserPD?.organisationName,
            "interestedInSettlingAbroad": findValueFromLookup(targetUserPD?.interestedInSettlingAbroad, "interestedInSettlingAbroad", lookupData) || targetUserPD?.interestedInSettlingAbroad,
            "income": findValueFromLookup(targetUserPD?.income, "income", lookupData) || targetUserPD?.income
          },
          "family": {
            "familyStatus": findValueFromLookup(familyData?.familyStatus, "familyStatus", lookupData) || familyData?.familyStatus,
            "familyValues": findValueFromLookup(familyData?.familyValues, "familyValues", lookupData) || familyData?.familyValues,
            "familyType": findValueFromLookup(familyData?.familyType, "familyType", lookupData) || familyData?.familyType,
            "familyIncome": findValueFromLookup(familyData?.familyIncome, "familyIncome", lookupData) || familyData?.familyIncome,
            "fatherOccupation": findValueFromLookup(familyData?.fatherOccupation, "fathersOccupation", lookupData) || familyData?.fatherOccupation,
            "motherOccupation": findValueFromLookup(familyData?.motherOccupation, "mothersOccupation", lookupData) || familyData?.motherOccupation,
            "brothers": findValueFromLookup(familyData?.brothers, "brothers", lookupData) || familyData?.brothers,
            "marriedBrothers": findValueFromLookup(familyData?.marriedBrothers, "marriedBrothers", lookupData) || familyData?.marriedBrothers,
            "sisters": findValueFromLookup(familyData?.sisters, "sisters", lookupData) || familyData?.sisters,
            "marriedSisters": findValueFromLookup(familyData?.marriedSisters, "marriedSisters", lookupData) || familyData?.marriedSisters,
            "gothra": findValueFromLookup(familyData?.gothra, "gothra", lookupData) || familyData?.gothra,
            "livingWithParents": findValueFromLookup(familyData?.livingWithParents, "livingWithParents", lookupData) || familyData?.livingWithParents,
            "familyBasedOutOf": countryData?.label || familyData?.familyBasedOutOf,
            "aboutMyFamily": findValueFromLookup(familyData?.aboutMyFamily, "aboutMyFamily", lookupData) || familyData?.aboutMyFamily,
          },
          "contact": {
            "alternateEmail": userData?.alternateEmail,
            "altMobileNumber": userData?.altMobileNumber,
            "landline": userData?.landline,
            "phoneNumber": requesterUserData?.unlockedProfiles?.indexOf(target_id) > -1 ? userData?.countryCode + userData?.phoneNumber : "",
            "email": requesterUserData?.unlockedProfiles?.indexOf(target_id) > -1 ? userData?.email : "",
            "name": requesterUserData?.unlockedProfiles?.indexOf(target_id) > -1 ? userData?.name : "",
          },
          "kundali": {
            "city": cityData?.cities.find((each_city) => each_city.value == targetUserPD?.cityOfBirth)?.label || targetUserPD?.cityOfBirth,
            "country": countryData?.label || targetUserPD?.countryOfBirth,
            "state": stateData?.states.find((each_state) => each_state.value == targetUserPD?.stateOfBirth)?.label ||  targetUserPD?.stateOfBirth,
            "tob": targetUserPD?.timeOfBirth,
            "manglik": findValueFromLookup(targetUserPD?.manglik, "manglik", lookupData) || targetUserPD?.manglik,
            "horoscope": findValueFromLookup(targetUserPD?.horoscope, "horoscopes", lookupData) || targetUserPD?.horoscope,
            "rashi": findValueFromLookup(targetUserPD?.rashi, "rashi", lookupData) || targetUserPD?.rashi,
            "nakshatra": findValueFromLookup(targetUserPD?.nakshatra, "nakshatra", lookupData) || targetUserPD?.nakshatra,
          },
          "lifeStyleData": {
            "habits": findValueFromLookup(lifeStyleData?.habits, "habits", lookupData) || lifeStyleData?.habits,
            "assets": findValueFromLookup(lifeStyleData?.assets, "assets", lookupData) || lifeStyleData?.assets,
            "movies": findValueFromLookup(lifeStyleData?.movies, "movies", lookupData) || lifeStyleData?.movies,
            "languages": lifeStyleData?.languages.map((each_language) => findValueFromLookup(each_language, "motherTongue", lookupData) || each_language).join(", "),
            "foodICook": findValueFromLookup(lifeStyleData?.foodICook, "foodICook", lookupData) || lifeStyleData?.foodICook,
            "hobbies": lifeStyleData?.hobbies.map((each_hobby) => findValueFromLookup(each_hobby, "hobbies", lookupData) || each_hobby).join(", "),
            "interest": lifeStyleData?.interest.map((each_interest) => findValueFromLookup(each_interest, "interests", lookupData) || each_interest).join(", "),
            "books":  lifeStyleData?.books.map((each_book) => findValueFromLookup(each_book, "books", lookupData) || each_book).join(", "),
            "dress": lifeStyleData?.dress.map((each_dress) => findValueFromLookup(each_dress, "dressStyle", lookupData) || each_dress).join(", "),
            "sports": lifeStyleData?.sports.map((each_sport) => findValueFromLookup(each_sport, "sports", lookupData) || each_sport).join(", "),
            "cuisine": lifeStyleData?.cuisine.map((each_cuisine) => findValueFromLookup(each_cuisine, "cuisines", lookupData) || each_cuisine).join(", "),
            "favRead": findValueFromLookup(lifeStyleData?.favRead, "favRead", lookupData) || lifeStyleData?.favRead,
            "favTVShow": findValueFromLookup(lifeStyleData?.favTVShow, "favTVShow", lookupData) || lifeStyleData?.favTVShow,
            "vacayDestination": findValueFromLookup(lifeStyleData?.vacayDestination, "vacayDestination", lookupData) || lifeStyleData?.vacayDestination,
            "dietaryHabits": findValueFromLookup(lifeStyleData?.dietaryHabits, "dietaryHabits", lookupData) || lifeStyleData?.dietaryHabits,
            "drinkingHabits": findValueFromLookup(lifeStyleData?.drinkingHabits, "drinkingHabits", lookupData) || lifeStyleData?.drinkingHabits,
            "smokingHabits": findValueFromLookup(lifeStyleData?.smokingHabits, "smokingHabits", lookupData) || lifeStyleData?.smokingHabits,
            "openToPets": lifeStyleData?.openToPets=="Y" ? "Yes" : lifeStyleData?.openToPets=="N" ? "No" : "Not filled",
            "ownAHouse": lifeStyleData?.ownAHouse=="Y" ? "Yes" : lifeStyleData?.ownAHouse=="N" ? "No" : "Not filled",
            "ownACar": lifeStyleData?.ownACar=="Y" ? "Yes" : lifeStyleData?.ownACar=="N" ? "No" : "Not filled",
            "favMusic": lifeStyleData?.favMusic.map((each_music) => findValueFromLookup(each_music, "music", lookupData) || each_music).join(", "),
          }
        }
        let match = [];
        
        if (currentUserPD && targetUserPD && (isWithin5YearsRange(currentUserPD.dob, targetUserPD.dob))) {
          match.push({ label: "Age", isMatched: true, value: formatDateToDDMMYYYY(currentUserPD?.dob) })
        }
        else {
          match.push({ label: "Age", isMatched: false, value: formatDateToDDMMYYYY(currentUserPD?.dob) })
        }
        if (currentUserPD?.maritalStatus == "nvm") {
          if (targetUserPD.maritalStatus == "nvm")
            match.push({ label: "Marital status", isMatched: true, value: "Never married" });
          else
            match.push({ label: "Marital status", isMatched: false, value: "Never married" });
        }
        else {
          if (targetUserPD?.maritalStatus != "nvm")
            match.push({ label: "Marital status", isMatched: true, value: findValueFromLookup(currentUserPD.maritalStatus, "maritalStatus", lookupData) || "Not filled" });
          else
            match.push({ label: "Marital status", isMatched: false, value: findValueFromLookup(currentUserPD.maritalStatus, "maritalStatus", lookupData) || "Not filled" });
        }
        if (currentUserPD && targetUserPD && currentUserPD.disability && targetUserPD.disability) {
          if (currentUserPD.disability == targetUserPD.disability) {
            match.push({ label: "Disability", isMatched: true, value: findValueFromLookup(currentUserPD.disability, "disability", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Disability", isMatched: false, value: findValueFromLookup(currentUserPD.disability, "disability", lookupData) || "Not filled" })
          }
        }
        if (currentUserPD && targetUserPD && currentUserPD.religion && targetUserPD.religion) {
          if (currentUserPD.religion === targetUserPD.religion) {
            match.push({ label: "Religion", isMatched: true, value: findValueFromLookup(currentUserPD.religion, "religion", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Religion", isMatched: false, value: findValueFromLookup(currentUserPD.religion, "religion", lookupData) || "Not filled" })
          }
        }
        if (currentUserPD && targetUserPD && currentUserPD.motherTongue && targetUserPD.motherTongue) {
          if (currentUserPD.motherTongue === targetUserPD.motherTongue) {
            match.push({ label: "Mother tongue", isMatched: true, value: findValueFromLookup(currentUserPD.motherTongue, "motherTongue", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Mother tongue", isMatched: false, value: findValueFromLookup(currentUserPD.motherTongue, "motherTongue", lookupData) || "Not filled" })
          }
        }
        if (currentUserLifeStyle && lifeStyleData && currentUserLifeStyle.smokingHabits && lifeStyleData.smokingHabits) {
          if (currentUserLifeStyle?.smokingHabits == lifeStyleData?.smokingHabits) {
            match.push({ label: "Smoking", isMatched: true, value: findValueFromLookup(currentUserLifeStyle?.smokingHabits, "smokingHabits", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Smoking", isMatched: false, value: findValueFromLookup(currentUserLifeStyle?.smokingHabits, "smokingHabits", lookupData) || "Not filled" })
          }
        }
        if (currentUserLifeStyle && lifeStyleData && currentUserLifeStyle.drinkingHabits && lifeStyleData.drinkingHabits) {
          if (currentUserLifeStyle?.drinkingHabits == lifeStyleData?.drinkingHabits) {
            match.push({ label: "Drinking", isMatched: true, value: findValueFromLookup(currentUserLifeStyle?.drinkingHabits, "drinkingHabits", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Drinking", isMatched: false, value: findValueFromLookup(currentUserLifeStyle?.drinkingHabits, "drinkingHabits", lookupData) || "Not filled" })
          }
        }
        if (currentUserPD?.manglik == "N/A") {
          if (targetUserPD?.manglik == "N/A") {
            match.push({ label: "Manglik", isMatched: true, value: findValueFromLookup(currentUserPD?.manglik, "manglik", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Manglik", isMatched: false, value: findValueFromLookup(currentUserPD?.manglik, "manglik", lookupData) || "Not filled" })
          }
        }
        else if (currentUserPD?.manglik == "non") {
          if (targetUserPD?.manglik == "non") {
            match.push({ label: "Manglik", isMatched: true, value: findValueFromLookup(currentUserPD?.manglik, "manglik", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Manglik", isMatched: false, value: findValueFromLookup(currentUserPD?.manglik, "manglik", lookupData) || "Not filled" })
          }
        }
        else {
          if (targetUserPD?.manglik == "ang" || targetUserPD?.manglik == "man") {
            match.push({ label: "Manglik", isMatched: true, value: findValueFromLookup(currentUserPD?.manglik, "manglik", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Manglik", isMatched: false, value: findValueFromLookup(currentUserPD?.manglik, "manglik", lookupData) || "Not filled" })
          }
        }
        if (currentUserPD.gender == "M") {
          let upperHeight = currentUserPD?.height + 2;
          let lowerHeight = 48;
          if (targetUserPD?.height >= lowerHeight && targetUserPD?.height <= upperHeight) {
            match.push({ label: "Height", isMatched: true, value: findValueFromLookup(currentUserPD?.height, "height", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Height", isMatched: false, value: findValueFromLookup(currentUserPD?.height, "height", lookupData) || "Not filled" })
          }
        }
        else {
          let lowerHeight = currentUserPD?.height - 2;
          let upperHeight = 84;
          if (targetUserPD?.height >= lowerHeight && targetUserPD?.height <= upperHeight) {
            match.push({ label: "Height", isMatched: true, value: findValueFromLookup(currentUserPD?.height, "height", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Height", isMatched: false, value: findValueFromLookup(currentUserPD?.height, "height", lookupData) || "Not filled" })
          }
        }
        if (currentUserPD.gender == "M") {
          let upperIncome = currentUserPD?.income + 2;
          let lowerIncome = 0;
          if (targetUserPD?.income >= lowerIncome && targetUserPD?.income <= upperIncome) {
            match.push({ label: "Income", isMatched: true, value: findValueFromLookup(currentUserPD?.income, "income", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Income", isMatched: false, value: findValueFromLookup(currentUserPD?.income, "income", lookupData) || "Not filled" })
          }
        }
        else {
          let lowerIncome = currentUserPD?.income - 2;
          let upperIncome = 14;
          if (targetUserPD?.income >= lowerIncome && targetUserPD?.income <= upperIncome) {
            match.push({ label: "Income", isMatched: true, value: findValueFromLookup(currentUserPD?.income, "income", lookupData) || "Not filled" })
          }
          else {
            match.push({ label: "Income", isMatched: false, value: findValueFromLookup(currentUserPD?.income, "income", lookupData) || "Not filled" })
          }
        }
        let matchedKeys = match.filter((each_match) => each_match.isMatched);
        let matchPercentage = (matchedKeys.length / match.length) * 100;
        result.matchData = match;
        result.matchPercentage = matchPercentage.toFixed(0);
        if (triggerNotification)
          await notificationService.sendNotificationToUser(target_id, "Profile viewed!", "Someone visited your profile. Find out who's interested in you!");
        return res.send({
          code: "CH200",
          status: "success",
          data: result,
        });
      }
      else {
        throw new Error("Invalid requester ID");
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
  getMyProfileView: async (req, res) => {
    try {
      let requester_id = req.userId;
      let familyData = await familySchema.findOne({ "clientID": requester_id });
      let lifeStyleData = await lifestyleSchema.findOne({ "clientID": requester_id });
      let currentUserPD = await personalDetailsSchema.findOne({ "clientID": requester_id });
      let userData = await userSchema.findById(requester_id);
      let result = {
        "miscellaneous": {
          "country": currentUserPD?.country,
          "state": currentUserPD?.state,
          "city": currentUserPD?.city,
          "heartsId": userData?.heartsId,
          "profilePic": userData?.profilePic,
          "clientID": userData?._id
        },
        "basic": {
          "cast": currentUserPD?.cast,
          "height": currentUserPD?.height,
          "state": currentUserPD?.state
        },
        "critical": {
          "dob": currentUserPD?.dob,
          "maritalStatus": currentUserPD?.maritalStatus
        },
        "contact": {
          "alternateEmail": userData?.alternateEmail,
          "altMobileNumber": userData?.altMobileNumber,
          "landline": userData?.landline,
          "phoneNumber": userData?.countryCode + userData?.phoneNumber,
          "email": userData?.email,
          "name": userData?.name,
        },
        "about": {
          "managedBy": currentUserPD?.managedBy,
          "description": userData?.description
        },
        "education": {
          "qualification": currentUserPD?.education?.qualification,
          "otherUGDegree": currentUserPD?.education?.otherUGDegree,
          "aboutEducation": currentUserPD?.education?.aboutEducation,
          "school": currentUserPD?.education?.school,
        },
        "career": {
          "aboutMyCareer": currentUserPD?.aboutMyCareer,
          "employed_in": currentUserPD?.employed_in,
          "occupation": currentUserPD?.occupation,
          "organisationName": currentUserPD?.organisationName,
          "interestedInSettlingAbroad": currentUserPD?.interestedInSettlingAbroad
        },
        "family": {
          "familyStatus": familyData?.familyStatus,
          "familyValues": familyData?.familyValues,
          "familyType": familyData?.familyType,
          "familyIncome": familyData?.familyIncome,
          "fatherOccupation": familyData?.fatherOccupation,
          "motherOccupation": familyData?.motherOccupation,
          "brothers": familyData?.brothers,
          "marriedBrothers": familyData?.marriedBrothers,
          "sisters": familyData?.sisters,
          "marriedSisters": familyData?.marriedSisters,
          "gothra": familyData?.gothra,
          "livingWithParents": familyData?.livingWithParents,
          "familyBasedOutOf": familyData?.familyBasedOutOf,
          "aboutMyFamily": familyData?.aboutMyFamily,
        },
        "kundali": {
          "city": currentUserPD?.cityOfBirth,
          "country": currentUserPD?.countryOfBirth,
          "state": currentUserPD?.stateOfBirth,
          "tob": currentUserPD?.timeOfBirth,
          "manglik": currentUserPD?.manglik,
          "horoscope": currentUserPD?.horoscope,
          "rashi": currentUserPD?.rashi,
          "nakshatra": currentUserPD?.nakshatra,
        },
        "lifeStyleData": {
          "habits": lifeStyleData?.habits,
          "habits": lifeStyleData?.habits,
          "assets": lifeStyleData?.assets,
          "movies": lifeStyleData?.movies,
          "languages": lifeStyleData?.languages,
          "foodICook": lifeStyleData?.foodICook,
          "hobbies": lifeStyleData?.hobbies,
          "interest": lifeStyleData?.interest,
          "books": lifeStyleData?.books,
          "dress": lifeStyleData?.dress,
          "sports": lifeStyleData?.sports,
          "cuisine": lifeStyleData?.cuisine,
          "favRead": lifeStyleData?.favRead,
          "favTVShow": lifeStyleData?.favTVShow,
          "vacayDestination": lifeStyleData?.vacayDestination,
          "dietaryHabits": lifeStyleData?.dietaryHabits,
          "drinkingHabits": lifeStyleData?.drinkingHabits,
          "smokingHabits": lifeStyleData?.smokingHabits,
          "openToPets": lifeStyleData?.openToPets,
          "ownAHouse": lifeStyleData?.ownAHouse,
          "ownACar": lifeStyleData?.ownACar,
          "foodICook": lifeStyleData?.foodICook,
          "favMusic": lifeStyleData?.favMusic
        }
      }
      return res.send({
        code: "CH200",
        status: "success",
        data: result,
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  getMyBlockedProfiles: async (req, res) => {
    try {
      let id = req.userId;
      let userProfiles = await userSchema.findById(id).lean().select({ blockList: 1 });
      let ids = userProfiles?.blockList;
      //console.log({ ids })
      let filteredProfiles = await getUsers.getListView(ids, req.userId, "ignoreInterestData", true);
      let notificationCount = await getUsers.getNotificationCount(filteredProfiles, req.userId, "blockedProfile")
      return res.send({
        code: "CH200",
        status: "success",
        message: "User fetched successfully.",
        filteredProfiles,
        notificationCount
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  unblockProfile: async (req, res) => {
    try {
      let blockedUserID = req.params.id;
      let updateUser = await userSchema.findOneAndUpdate(
        { _id: req.userId },
        { $pull: { blockList: blockedUserID } }
      );
      return res.send({
        code: "CH200",
        status: "success",
        message: "Profile unblocked successfully.",
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  unIgnoreProfile: async (req, res) => {
    try {
      let ignoreUserID = req.params.id;
      let updateUser = await userSchema.findOneAndUpdate(
        { _id: req.userId },
        { $pull: { ignoreList: ignoreUserID } }
      );
      return res.send({
        code: "CH200",
        status: "success",
        message: "Profile un-ignored successfully.",
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  getMyDeclinedProfiles: async (req, res) => {
    try {
      let interestData = await interestSchema.find({ "receiver_id": req.userId, "status": "reject" }).select({ "requester_id": 1 }).lean();
      let ids = [];
      for (let i = 0; i < interestData?.length; i++) {
        ids.push(interestData[i]?.requester_id.toString());
      }
      //console.log("knob", { ids })
      let filteredProfiles = await getUsers.getListView(ids, req.userId, "ignoreInterestData", false, true);
      let notificationCount = await getUsers.getNotificationCount(filteredProfiles, req.userId, "iDeclined")

      return res.send({
        code: "CH200",
        status: "success",
        message: "User fetched successfully.",
        filteredProfiles,
        notificationCount
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  getUsersWhoHaveDeclinedMe: async (req, res) => {
    try {
      let interestData = await interestSchema.find({ "requester_id": req.userId, "status": "reject" }).select({ "receiver_id": 1 }).lean();
      let ids = [];
      for (let i = 0; i < interestData?.length; i++) {
        ids.push(interestData[i]?.receiver_id.toString());
      }
      //console.log("knob", { ids })
      let filteredProfiles = await getUsers.getListView(ids, req.userId, "ignoreInterestData");
      let notificationCount = await getUsers.getNotificationCount(filteredProfiles, req.userId, "theyDeclined")
      return res.send({
        code: "CH200",
        status: "success",
        message: "User fetched successfully.",
        filteredProfiles,
        notificationCount
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  getAllProfiles: async (req, res) => {
    try {
      let currentUserData = await userSchema.findById(req.userId);
      let personalDetails = await personalDetailsSchema.findOne({ "clientID": req.userId });
      if (!personalDetails) throw new Error("Unable to fetch personal details");
      let query_obj = {};
      query_obj["gender"] = personalDetails.gender == 'M' ? 'F' : 'M';
      if (personalDetails?.maritalStatus == "nvm") {
        query_obj["maritalStatus"] = "nvm";
      }
      else {
        query_obj["maritalStatus"] = { $in: ["ann", "sep", "wid", "div", "pend"] }
      }
      if (currentUserData?.ignoreList?.length) {
        query_obj["clientID"] = { $nin: currentUserData?.ignoreList }
      }
      //console.log("query for search==>", JSON.stringify(query_obj))
      let recommendedProfiles = await personalDetailsSchema.find(query_obj).select({ "clientID": 1, _id: 0 });
      if (!recommendedProfiles) {
        throw new Error('No profiles found. Please contact admin.');
      }
      let ids = [];
      for (let i = 0; i < recommendedProfiles.length; i++) {
        ids.push(recommendedProfiles[i].clientID);
      }
      //console.log(req.userId, { ids });
      let filteredProfiles = await getUsers.getListView(ids, req.userId);
      // console.log(filteredProfiles);
      filteredProfiles.sort((a, b) => (b.profilePic.length > 0) - (a.profilePic.length > 0));
      return res.send({
        code: "CH200",
        status: "success",
        message: "Profiles fetched successfully.",
        filteredProfiles
      });

    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  unlockProfile: async (req, res) => {
    try {
      let targetUserID = req.params.target_id;
      let targetUser = await userSchema.findById(targetUserID);
      if (!targetUser) throw new Error("Target user not found. Please contact admin");
      let currentUser = await userSchema.findById(req.userId);
      if (currentUser?.unlockedProfiles.indexOf(targetUserID) > -1) {
        throw new Error("This profile is already unlocked.")
      }
      if (new Date().getTime() < new Date(currentUser?.memberShipExpiryDate).getTime() && currentUser?.heartCoins > 0) {
        if (mongoUtilService.isValidMongoId(targetUserID)) {
          let updateUser = await userSchema.findByIdAndUpdate(req.userId, {
            $addToSet: { "unlockedProfiles": targetUserID },
            $inc: { "heartCoins": -1 }
          })
          return res.send({
            code: "CH200",
            status: "success",
            message: "Profile unlocked successfully."
          });
        }
        else {
          throw new Error("Invalid target user ID");
        }
      }
      else {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: { msg: "Please renew your membership in order to unlock further profiles..", "redirectToMembership": true },
        });
        // throw new Error({ msg: "Please renew your membership in order to unlock further profiles..", "redirectToMembership": true })
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
  getMyUnlockedProfiles: async (req, res) => {
    try {
      let id = req.userId;
      let userProfiles = await userSchema.findById(id).lean().select({ unlockedProfiles: 1 });
      let ids = userProfiles?.unlockedProfiles;
      //console.log({ ids })
      let filteredProfiles = await getUsers.getListView(ids, req.userId, "ignoreInterestData", true);
      let notificationCount = await getUsers.getNotificationCount(filteredProfiles, req.userId, "unlockedProfiles")
      return res.send({
        code: "CH200",
        status: "success",
        message: "Users fetched successfully.",
        filteredProfiles,
        notificationCount
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  getSliderPics: async (req, res) => {
    try {
      let fileName = req.params.name + ".jpg";
      let data = await s3uploadHelper.s3Download(
        fileName,
        process.env.SLIDER_BUCKET_NAME
      );
      if (!data) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "File not found. Please try again.",
        });
      }
      res.setHeader("Content-Type", data.ContentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="connectingHearts_sliderpic_${fileName}"`
      );
      return res.send(data.Body);
    } catch (e) {
      console.log(e);
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "Unable to fetch slider pics.",
      });
    }
  },
  submitReview: async (req, res) => {
    try {
      let rating = req.body.rating;
      let comments = req.body.comments;
      await reviewSchema.insertMany({
        clientID: req.userId,
        rating,
        comments
      });
      return res.send({
        code: "CH200",
        status: "success",
        message: "Review submitted successfully",
        navigateToPlayStore: rating >= 3 ? true : false
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  getMyMembershipDetails: async (req, res) => {
    try {
      let id = req.userId;
      let userData = await userSchema.findById(id);
      if (!userData) {
        throw new Error("User not found. Please try again.")
      }
      return res.send({
        code: "CH200",
        status: "success",
        message: "Membership fetched successfully",
        membershipData: {
          memberShipExpiryDate: userData?.memberShipExpiryDate > new Date() ? userData?.memberShipExpiryDate : null,
          heartCoins: userData?.heartCoins ? userData?.heartCoins : null,
          planName: userData?.memberShipExpiryDate > new Date() && userData?.heartCoins ? userData?.planName : null,
          membership_id: userData?.memberShipExpiryDate > new Date() && userData?.heartCoins ? userData?.membership_id : null
        }
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  getMyInterestedProfiles: async (req, res) => {
    try {
      let interestData = await interestSchema.find({ "requester_id": req.userId, "status": "new" }).select({ "receiver_id": 1 }).lean();
      let ids = [];
      for (let i = 0; i < interestData?.length; i++) {
        ids.push(interestData[i]?.receiver_id.toString());
      }
      let filteredProfiles = await getUsers.getListView(ids, req.userId, "ignoreInterestData");
      let notificationCount = await getUsers.getNotificationCount(filteredProfiles, req.userId, "interestSent")

      return res.send({
        code: "CH200",
        status: "success",
        message: "User fetched successfully.",
        filteredProfiles,
        notificationCount
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  updateNotificationCount: async (req, res) => {
    try {
      let body = req.body;
      //console.log(body)
      let keys = ["ids", "type"];
      if (!validationFunc.validateBody(keys, body)) {
        throw new Error("Invalid body. Please try again.")
      }
      await notificationSchema.findOneAndUpdate({ "clientID": req.userId, "type": body.type },
        { ids: body.ids, type: body.type, clientID: req.userId }, { upsert: true });
      return res.send({
        code: "CH200",
        status: "success",
        message: "Count updated successfully"
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  updateName: async (req, res) => {
    try {
      let body = req.body;
      let keys = ["name","number"];
      if (!validationFunc.validateBody(keys, body)) { 
        throw new Error("Invalid body. Please try again.")
      }

      // Get today's date with time set to midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find or create today's update record
      let todayUpdates = await nameUpdateSchema.findOne({ date: today });
      if (!todayUpdates) {
        todayUpdates = new nameUpdateSchema({ date: today, updateCount: 0 });
      }

      // Check if daily limit reached
      if (todayUpdates.updateCount >= 1) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Daily name update limit has been reached. Please try again tomorrow."
        });
      }

      // Update the name
      await userSchema.findOneAndUpdate({ "phoneNumber": body.number }, { name: body.name });
      
      // Increment the update counter
      todayUpdates.updateCount += 1;
      await todayUpdates.save();

      return res.send({
        code: "CH200",
        status: "success",
        message: "Name updated successfully"
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : e,
      });
    }
  },
  // inputUsers: async (req,res) =>{
  //   function calculateDateOfBirth(age) {
  //     const newDate = new Date();

  //     // Subtract the specified number of years
  //     newDate.setFullYear(newDate.getFullYear() - age);

  //     return newDate;
  //   }
  //   let users= req.body.users;
  //   for(let i=0;i<users.length;i++){
  //     //console.log("id is",users[i].membershipName)
  //     let member_info=findMembershipData(users[i].membershipName)
  //     //console.log("dob is",calculateDateOfBirth(users[i].dob))
  //     let saved_user = await userSchema.findOneAndUpdate({"phoneNumber":users[i].phoneNumber},{
  //       "phoneNumber":users[i].phoneNumber,
  //       "email":users[i].email,
  //       "membership_id":member_info?member_info._id:null,
  //       "memberShipExpiryDate":member_info?addMonthsToDate(member_info?.duration):"",
  //       "heartCoins":member_info?member_info.heartCoins:"",
  //       "name":users[i].name,
  //       "profilePic": [],
  //       "screenName":"dashboard",
  //       "heartsId":users[i].heartsId,
  //       "password":await argon.hash(users[i].password),
  //       "countryCode": users[i].countryCode,
  //       "isVerified":true,
  //       "membershipStartDate":new Date(),
  //       "planName":member_info?users[i].membershipName:""
  //     },{upsert:true,new:true});
  //     let pd_user = await personalDetailsSchema.findOneAndUpdate({clientID:saved_user._id},{
  //       "gender":users[i].gender,
  //       "maritalStatus":users[i].maritalStatus,
  //       "dob":calculateDateOfBirth(users[i].dob),
  //       "country": users[i].country,
  //       "clientID":saved_user._id
  //     },{upsert:true});
  //     //console.log(pd_user)
  //   }
  //   return res.send("Done");
  // }
};
