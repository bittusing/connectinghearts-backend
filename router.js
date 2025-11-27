const router = require("express").Router(); 
const userRouter = require("./api/users/user.router");
const personalRouter = require("./api/personalDetails/personal.router");
const srcmRouter = require("./api/srcmDetails/srcm.router");
const profileRouter = require("./api/profileDetails/profile.router");
const familyRouter = require("./api/familyDetails/family.router");
const preferenceRouter = require("./api/partnerPreference/preference.router");
const commonRouter = require("./api/commonApis/common.router");
const logicalRouter = require("./api/logicController/logic.router");
const dashboardRouter = require("./api/dashboardController/dashboard.router");
const adminChRouter = require("./api/adminController/admin.router")
// const helpers = require("./helper_functions/s3uploader");
// const {protectedRoute} = require("./middlewares/auth")

router.use("/api/auth", userRouter);
router.use("/api/personalDetails", personalRouter);
router.use("/api/srcmDetails", srcmRouter);
router.use("/api/profile", profileRouter);
router.use("/api/family", familyRouter);
router.use("/api/preference", preferenceRouter);
router.use("/api/lookup", commonRouter);
router.use("/api/interest", logicalRouter);
router.use("/api/dashboard", dashboardRouter);
router.use("/api/chAdmin", adminChRouter);
// router.use("/api/file/:fileName",helpers.s3Download);
module.exports=router;
