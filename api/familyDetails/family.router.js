const router = require("express").Router();
const {updateFamilyDetails,getFamilyDetails } = require("./family.controller");
const {  protectedRoute } = require('../../middlewares/auth');

router.patch("/", protectedRoute,updateFamilyDetails);
router.get("/", protectedRoute,getFamilyDetails);

module.exports = router;