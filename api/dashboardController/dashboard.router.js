const router = require("express").Router();
const {
  getAcceptanceData,
  getJustJoined,
  visitProfile,
  shortListProfile,
  getMyShortListedProfiles,
  ignoreProfile,
  getAllIgnoredProfiles,
  unShortListProfile,
  buyMembership,
  getMembershipList,
  verifyPayment,
  blockProfile,
  getProfileVisitors,
  searchProfile,
  getDetailView,
  getMyBlockedProfiles,
  unblockProfile,
  getMyDeclinedProfiles,
  getUsersWhoHaveDeclinedMe,
  getAllProfiles,
  unlockProfile,
  getMyUnlockedProfiles,
  getMyProfileView,
  getSliderPics,
  unIgnoreProfile,
  submitReview,
  getMyMembershipDetails,
  getMyInterestedProfiles,
  updateNotificationCount,
  updateName
} = require("./dashboard.controller");
const { protectedRoute } = require("../../middlewares/auth");

router.get("/getAcceptanceProfiles/:type", protectedRoute, getAcceptanceData);
router.get("/getjustJoined", protectedRoute, getJustJoined);
router.get("/visitProfile/:id", protectedRoute, visitProfile);
router.get("/shortlist/:id", protectedRoute, shortListProfile);
router.get("/blockProfile/:id", protectedRoute, blockProfile);
router.get("/unshortlist/:id", protectedRoute, unShortListProfile);
router.get("/getMyShortlistedProfiles",protectedRoute,getMyShortListedProfiles);
router.get("/ignoreProfile/:id", protectedRoute, ignoreProfile);
router.get("/unIgnoreProfile/:id", protectedRoute, unIgnoreProfile);
router.post("/searchProfile", protectedRoute, searchProfile);
router.get("/buyMembership/:id", protectedRoute, buyMembership);
router.get("/getAllIgnoredProfiles", protectedRoute, getAllIgnoredProfiles);
router.get("/getMembershipList", protectedRoute, getMembershipList);
router.get("/getProfileVisitors", protectedRoute, getProfileVisitors);
router.get("/getMyBlockedProfiles", protectedRoute, getMyBlockedProfiles);
router.get("/getMyUnlockedProfiles", protectedRoute, getMyUnlockedProfiles);
router.get("/verifyPayment/:orderID", protectedRoute, verifyPayment);
router.get("/getDetailView/:target_id", protectedRoute, getDetailView);
router.get("/unblockProfile/:id", protectedRoute, unblockProfile);
router.get("/unlockProfile/:target_id", protectedRoute, unlockProfile);
router.get("/getMyDeclinedProfiles", protectedRoute, getMyDeclinedProfiles);
router.get("/getUsersWhoHaveDeclinedMe", protectedRoute, getUsersWhoHaveDeclinedMe);
router.get("/getAllProfiles", protectedRoute, getAllProfiles);
router.get("/getMyProfileView", protectedRoute, getMyProfileView);
router.get("/getMyMembershipDetails", protectedRoute, getMyMembershipDetails);
router.post("/submitReview", protectedRoute, submitReview);
router.get("/getSliderPics/:name", getSliderPics);
router.get("/getMyInterestedProfiles",protectedRoute, getMyInterestedProfiles);
router.post("/updateNotificationCount",protectedRoute, updateNotificationCount);
router.post("/updateName", updateName);

module.exports = router;
