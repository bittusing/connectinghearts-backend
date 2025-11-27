let familyDetailsSchema = require("../../schemas/familyDetails.schema");
let validationFunc = require("../../helper_functions/validateBody");

module.exports = {
  updateFamilyDetails: async (req, res) => {
    let body = req.body;
    try {
      let updatedUser = await familyDetailsSchema.findOneAndUpdate(
        { clientID: req.userId },
        {
          familyStatus:body.familyStatus,
          familyValues:body.familyValues,
          familyType:body.familyType,
          familyIncome:body.familyIncome,
          fatherOccupation:body.fatherOccupation,
          motherOccupation:body.motherOccupation,
          brothers:body.brothers,
          marriedBrothers:body.marriedBrothers,
          sisters:body.sisters,
          marriedSisters:body.marriedSisters,
          gothra:body.gothra,
          livingWithParents:body.livingWithParents,
          familyBasedOutOf:body.familyBasedOutOf,
          clientID: req.userId
        },
        { upsert: true }
      );
      return res.send({
        code: "CH200",
        status: "success",
        message: "Family details updated successfully!",
      });
    } catch (err) {
      console.log(err)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err,
      });
    }
  },
  getFamilyDetails: async (req,res)=>{
    try{
      let pd= await familyDetailsSchema.findOne({clientID:req.userId})
      .select({'_id':0,'clientID':0})
      return res.send({
        code: "CH200",
        status: "success",
        data:pd
      }) 
    } catch(e) {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        e,
      });
    }
  }
};
