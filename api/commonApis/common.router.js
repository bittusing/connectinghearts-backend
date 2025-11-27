const router = require("express").Router();
const { getLookup, getCountryLookup, getStateLookup, getCityLookup,getIncomeLookup,getCountryCodeLookup, downloadAllS3Images } = require("./common.controller");
const { protectedRoute,customRoute } = require('../../middlewares/auth');

router.get("/", protectedRoute, getLookup);
router.get("/getCountryLookup", protectedRoute, getCountryLookup);
router.get("/getStateLookup/:countryId", protectedRoute, getStateLookup);
router.get("/getCityLookup/:stateId", protectedRoute, getCityLookup);
router.get("/getIncomeLookup", protectedRoute, getIncomeLookup);
router.post("/s3/downloadAll", downloadAllS3Images);
// router.get("/countryLookup",protectedRoute,getCountryLookup);

module.exports = router;