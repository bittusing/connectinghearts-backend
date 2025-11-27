const router = require("express").Router();
const { signup, verifyOTP, login, searchByProfileID, getUser, updateLastActiveScreen, generateOtp, validateToken, deleteUser, changePassword, forgetPassword, verifyForgottenOTP,
    updateForgottenPassword,deleteProfile,checkUpdate,updateVersion,resetPasswordToDefault,patchHeartsId } = require("./user.controller");
const { protectedRoute, adminProtectedRoute } = require('../../middlewares/auth');

router.post("/signup", protectedRoute, signup);
router.post("/verifyOTP", verifyOTP);
router.post("/login", login);
router.patch("/changePassword", protectedRoute, changePassword);
router.get("/forgetPassword/:phoneNumber", forgetPassword);
router.post("/verifyForgottenOTP", verifyForgottenOTP);
router.post("/updateForgottenPassword",protectedRoute, updateForgottenPassword);
router.get("/getUser", protectedRoute, getUser);
router.get("/patchHeartsId", protectedRoute, patchHeartsId);
router.get("/validateToken", protectedRoute, validateToken);
router.get("/searchByProfileID/:heartsId", protectedRoute, searchByProfileID);
router.patch("/updateLastActiveScreen/:screen", protectedRoute, updateLastActiveScreen);
router.post("/generateOtp", generateOtp);
router.delete("/deleteUser/:phone",adminProtectedRoute, deleteUser);
router.delete("/deleteProfile",protectedRoute, deleteProfile);
router.get("/checkUpdate/:received_id", checkUpdate);
router.get("/updateVersion/:phone/:version", updateVersion);
router.get("/resetPasswordToDefault/:phoneNumber/:password", resetPasswordToDefault);

module.exports = router;