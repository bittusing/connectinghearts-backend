const router = require("express").Router();
const {
  getAllUsers,
  verifyUser,
  grantMembership,
  sendBulkNotifications,
  testEmail
} = require("./admin.controller");
const { adminProtectedRoute } = require("../../middlewares/auth");

router.get("/getAllUsers/:type", adminProtectedRoute, getAllUsers);
router.post("/triggerNotifications", sendBulkNotifications);
router.get("/verifyUser/:id", adminProtectedRoute, verifyUser);
router.post("/grantMembership", adminProtectedRoute, grantMembership);
router.post("/testEmail", testEmail);

module.exports = router;
