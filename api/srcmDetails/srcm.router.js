const router = require("express").Router();
const {getSrcmDetails,uploadSrcmDetails,downloadSrcmId,postSrcmDetails } = require("./srcm.controller");
const {  protectedRoute } = require('../../middlewares/auth');
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/uploadSrcmId", protectedRoute,upload.single('srcmPhoto'),uploadSrcmDetails);
router.get("/", protectedRoute,getSrcmDetails);
router.get("/file/:fileName" , downloadSrcmId);
router.patch("/updateSrcmDetails" ,protectedRoute, postSrcmDetails);


module.exports = router;