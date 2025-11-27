let userSchema = require("../../schemas/user.schema");
let validationFunc = require("../../helper_functions/validateBody");
let s3uploadHelper = require("../../helper_functions/s3Helper");
const { ObjectId } = require('mongodb');

module.exports = {
  updateProfileDetails: async (req, res) => {
    let body = req.body;
    try {
      let currentProfile = await userSchema.findOne(
        { _id: req.userId });
      if (!currentProfile) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: 'Profile not found for this ID',
        });
      }
      if (body?.description)
        currentProfile.description = body?.description;
      if (currentProfile?.profilePic?.length == 0) {
        currentProfile.profilePic = [{
          s3Link: body?.s3Link,
          id: body?.id,
          primary: body?.primary
        }]
      }
      else {
        let flag=true;
        if(body.primary==true){
          for (let i = 0; i < currentProfile?.profilePic?.length; i++) {
            if (currentProfile?.profilePic[i]?.primary == true) {
              currentProfile.profilePic[i].s3Link = body?.s3Link;
              currentProfile.profilePic[i].id = body?.id;
            }
          }
        }
        else{
          currentProfile?.profilePic?.push({
            s3Link: body?.s3Link,
            id: body?.id,
            primary: body?.primary
          })
        }

      }
      //console.log(currentProfile)
      let updatedUser = await userSchema.findOneAndUpdate(
        { _id: req.userId },
        currentProfile
      );

      return res.send({
        code: "CH200",
        status: "success",
        message: "Profile details updated successfully!",
      });
    } catch (err) {
      console.log({ err })
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err,
      });
    }
  },
  uploadProfilePic: async (req, res) => {
    try {
      let s3Link = await s3uploadHelper.s3Upload(
        req.file,
        process.env.DP_BUCKET_NAME
      );
      let id = new Date().getTime(),profilePics=[];
      let curr_profile=await userSchema.findById(req.userId).select("profilePic");
      if(req.body.primary=="true" || req.body.primary==true){
        profilePics=curr_profile?.profilePic?.filter(e=>!e.primary);
      }
      else{
        profilePics=curr_profile?.profilePic;
      }
      profilePics.push({ s3Link, id, primary: req.body.primary });
      await userSchema.updateOne({ _id: req.userId }, { "profilePic":profilePics} );
      return res.send({ fileName: s3Link, id });
    }
    catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e?.message,
      });
    }
  },
  downloadProfilePic: async (req, res) => {
    try {
      if (!req.params.userId) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Please provide ID of the user.",
        });
      }
      if (!req.params.fileId) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Please provide file ID.",
        });
      }
      if(!ObjectId.isValid(req.params.userId)){
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Please provide correct user ID.",
        });
      }
      console.log(typeof req.params.fileId)
      let userProfile = await userSchema.findOne({ _id: req.params.userId }).select({ _id: 0, profilePic: 1 });
      if (!userProfile) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "No user found for this ID.",
        });
      }
      userProfile = userProfile.toObject();
      let profileCollection = userProfile.profilePic;
      let fileName, flag = false;
      for (let i = 0; i < profileCollection.length; i++) {
        if (profileCollection[i].id == req.params.fileId) {
          fileName = profileCollection[i].s3Link;
          flag = true;
          break;
        }
      }
      if (!flag) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "No file found for the provided ID. Please contact admin.",
        });
      }
      //console.log("fileName", fileName);

      let data = await s3uploadHelper.s3Download(
        fileName,
        process.env.DP_BUCKET_NAME
      );
      console.log(data)
      res.setHeader("Content-Type", data.ContentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="connectingHearts_profilepic_${fileName}"`
      );
      return res.send(data.Body);
    }
    catch (err) {
      console.log(err)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "File not found in our storage. Please check the key.",
      });
    }
  },
  deleteProfilePic: async (req, res) => {
    try {
      let body = req.params;
      let keys = ["id"];
      if (!validationFunc.validateBody(keys, body)) {
        throw new Error("Invalid body. Please try again.");
      }
      let userData = await userSchema.updateOne({ _id: req.userId }, { $pull: { profilePic: { id: req.params.id } } });
      return res.send({
        code: "CH200",
        status: "success",
        message: "Profile pictures updated successfully!",
      })
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e?.message ? e?.message : e
      });
    }
  }
};
