let srcmDetailsSchema = require("../../schemas/srcmDetails.schema");
let validationFunc = require("../../helper_functions/validateBody");
let s3uploadHelper = require("../../helper_functions/s3Helper");
module.exports = {
  uploadSrcmDetails: async (req, res) => {
    try{
    let s3Link = await s3uploadHelper.s3Upload(
      req.file,
      process.env.SRCM_BUCKET_NAME
    );
    return res.send({ fileName: s3Link });
    }
    catch(e){
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e?.message,
      });
    }
  },
  getSrcmDetails: async (req,res) => {
    try{
      let pd= await srcmDetailsSchema.findOne({clientID:req.userId})
      .select({'_id':0,'clientID':0})
      return res.send({
        code: "CH200",
        status: "success",
        data:pd
      }) 
    } catch(e) {
      console.log(e);
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        e,
      }); 
    }
  },
  postSrcmDetails: async (req,res) => {
    let body = req.body;
    console.log("srcm",{body})
    // let keys = ["srcmIdNumber","satsangCentreName","preceptorsName","preceptorsContactNumber","preceptorsEmail","srcmIdFilename"];
    // if (!validationFunc.validateBody(keys, body)) {
    //   return res.status(400).send({
    //     code: "CH400",
    //     status: "failed",
    //     err: "Invalid body. Please try again.",
    //   });
    // }
    try{
      await srcmDetailsSchema.findOneAndUpdate({clientID: req.userId},{
        srcmIdNumber:body.srcmIdNumber,
        satsangCentreName:body.satsangCentreName,
        preceptorsName:body.preceptorsName,
        preceptorsContactNumber:body.preceptorsContactNumber,
        preceptorsEmail:body.preceptorsEmail,
        srcmIdFilename:body.srcmIdFilename,
        clientID: req.userId
      },{upsert:true});
      return res.send({
        code: "CH200",
        status: "success",
        message: "SRCM details updated successfully!",
      });
    }
    catch(err){
      console.log(err)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err,
      });
    }
  },
  downloadSrcmId: async (req, res) => {
    let fileName = req.params.fileName;
    try{
      let data = await s3uploadHelper.s3Download(
        fileName,
        process.env.SRCM_BUCKET_NAME
      );
      res.setHeader("Content-Type", data.ContentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="connectingHearts_srcmid_${fileName}"`
      );
      return res.send(data.Body);
    }
    catch(err){
      console.log(err)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: "File not found in our storage. Please check the key.",
      });
    }

  },
};
