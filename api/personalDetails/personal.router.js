const router = require("express").Router();
const {updatePersonalDetails,getPersonalDetails,editProfile,getUserProfileData } = require("./personal.controller");
const {  protectedRoute } = require('../../middlewares/auth');

router.patch("/", protectedRoute,updatePersonalDetails);
router.patch("/editProfile", protectedRoute,editProfile);
router.get("/", protectedRoute,getPersonalDetails);
router.get("/getUserProfileData", protectedRoute,getUserProfileData);

module.exports = router;