let preferenceSchema = require("../../schemas/partnerPreference.schema");
let validationFunc = require("../../helper_functions/validateBody");

module.exports = {
  updatePreferenceDetails: async (req, res) => {
    let body = req.body;
    console.log("this is the body",JSON.stringify(body))
    try {
      let updatedUser = await preferenceSchema.findOneAndUpdate(
        { clientID: req.userId },
        {
          age:body.age,
          height:body.height,
          income:body.income,
          country:body.country,
          residentialStatus:body.residentialStatus,
          occupation:body.occupation,
          maritalStatus:body.maritalStatus,
          religion:body.religion,
          cast:body.cast,
          education:body.education,
          horoscope:body.horoscope,
          motherTongue:body.motherTongue,
          manglik:body.manglik,
          education:body.education,
          clientID: req.userId
        },
        { upsert: true }
      );
      return res.send({
        code: "CH200",
        status: "success",
        message: "Partner preferences updated successfully!",
      });
    } catch (err) {
      console.log({err})
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err,
      });
    }
  },
  getPreferenceDetails: async (req,res)=>{
    try{
      let pd= await preferenceSchema.findOne({clientID:req.userId})
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
  }
};
