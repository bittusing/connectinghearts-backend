const router = require("express").Router();
const {sendInterest,getInterests,updateInterest,sendNotifications,getDailyRecommendations,truncateDB,unsendInterest } = require("./logic.controller");
const {  protectedRoute } = require('../../middlewares/auth');

router.post("/sendInterest", protectedRoute,sendInterest);
router.post("/unsendInterest", protectedRoute,unsendInterest);
router.get("/getInterests", protectedRoute,getInterests);
router.get("/getDailyRecommendations", protectedRoute,getDailyRecommendations);
router.post("/updateInterest", protectedRoute,updateInterest);
router.get("/sendNotifications",sendNotifications);

module.exports = router;