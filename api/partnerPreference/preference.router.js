const router = require("express").Router();
const {updatePreferenceDetails,getPreferenceDetails } = require("./preference.controller");
const {  protectedRoute } = require('../../middlewares/auth');

router.patch("/", protectedRoute,updatePreferenceDetails);
router.get("/", protectedRoute,getPreferenceDetails);

module.exports = router;