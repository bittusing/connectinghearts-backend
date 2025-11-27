const router = require("express").Router();
const {updateProfileDetails,uploadProfilePic,downloadProfilePic,deleteProfilePic } = require("./profile.controller");
const {  protectedRoute } = require('../../middlewares/auth');
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.patch("/", protectedRoute,updateProfileDetails);
router.post("/uploadProfilePic", protectedRoute,upload.single('profilePhoto'),uploadProfilePic);
router.get("/file/:userId/:fileId" , downloadProfilePic);
router.delete("/deleteProfilePic/:id" ,protectedRoute, deleteProfilePic);

module.exports = router;