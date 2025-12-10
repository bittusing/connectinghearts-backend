let validationFunc = require("../../helper_functions/validateBody");
const userSchema = require("../../schemas/user.schema");
const familySchema = require("../../schemas/familyDetails.schema");
const lifestyleSchema = require("../../schemas/lifestyle.schema");
const personalDetailsSchema = require("../../schemas/personalDetails.schema");

module.exports = {
  updatePersonalDetails: async (req, res) => {
    let body = req.body;
    // let keys = ["gender", "dob", "height", "country", "state", "city"];
    // if (!validationFunc.validateBody(keys, body)) {
    //   return res.status(400).send({
    //     code: "CH400",
    //     status: "failed",
    //     err: "Invalid body. Please try again.",
    //   });
    // }
    try {
      let pdObj={
        gender: body?.gender,
        dob: body?.dob,
        height: body?.height,
        country: body?.country,
        state: body?.state,
        city: body?.city,
        income: body?.income,
        residentialStatus: body?.residentialStatus,
        maritalStatus: body?.maritalStatus,
        occupation: body?.occupation,
        religion: body?.religion,
        cast: body?.cast,
        motherTongue: body?.motherTongue,
        horoscope: body?.horoscope,
        manglik: body?.manglik,
        haveChildren: body?.haveChildren,
        clientID: req.userId,
        aboutMe: body?.aboutMe,
        managedBy: body?.managedBy,
        employed_in: body?.employed_in,
        castNoBar: body?.castNoBar
      }
      if (body.education) {
        pdObj.education = {
          qualification: body.education.qualification,
          otherUGDegree: body.education.otherUGDegree,
        };
      }

      await personalDetailsSchema.findOneAndUpdate(
        { clientID: req.userId  },pdObj,{ upsert: true });

      return res.send({
        code: "CH200",
        status: "success",
        message: "Personal details updated successfully!",
      });
    } catch (err) {
      console.log({ err });
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err,
      });
    }
  },
  getPersonalDetails: async (req, res) => {
    try{
      let pd = await personalDetailsSchema
      .findOne({ clientID: req.userId  })
      .select({ _id: 0, clientID: 0 });
    return res.send({
      code: "CH200",
      status: "success",
      data: pd,
    }); 
    } catch(e) {
      console.log(e);
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        e,
      });
    }
  },
  editProfile: async (req, res) => {
    try {
      let id = req.userId, body = req.body;
      if (body.section == "basic") {
        let personalDetailsbody = {
          "cast": body?.cast,
          "height": body?.height,
          "country": body?.country,
          "state": body?.state,
          "city": body?.city,
          "religion": body?.religion,
          "income": body?.income,
          "motherTongue": body?.motherTongue
        }
        let updateData = await personalDetailsSchema.updateOne({ "clientID": id }, personalDetailsbody)
      }
      else if (body.section == "critical") {
        let personalDetailsbody = {
          "dob": new Date(body?.dob)
        }
        let updateData = await personalDetailsSchema.updateOne({ "clientID": id  }, personalDetailsbody)
      }
      else if (body.section == "about") {
        let userDetailsbody = {
          "description": body?.description
        }
        let personalDetailsbody = {
          "managedBy": body?.managedBy,
          "bodyType": body?.bodyType,
          "thalassemia": body?.thalassemia,
          "hivPositive": body?.hivPositive,
          "disability": body?.disability,
        }
        let updateData = await personalDetailsSchema.updateOne({ "clientID": id  }, personalDetailsbody)
        let updateUserData = await userSchema.updateOne({ "_id": id }, userDetailsbody)
      }
      else if (body.section == "education") {
        let personalDetailsbody = {
          "education.qualification": body?.qualification,
          "education.otherUGDegree": body?.otherUGDegree,
          "education.aboutEducation": body?.aboutEducation,
          "education.school": body?.school,
        }
        let updateData = await personalDetailsSchema.updateOne({ "clientID": id }, personalDetailsbody)
      }
      else if (body.section == "career") {
        let personalDetailsbody = {
          "aboutMyCareer": body?.aboutMyCareer,
          "employed_in": body?.employed_in,
          "occupation": body?.occupation,
          "organisationName": body?.organisationName,
          "interestedInSettlingAbroad":body?.interestedInSettlingAbroad
        }
        let updateData = await personalDetailsSchema.updateOne({ "clientID": id }, personalDetailsbody)
      }
      else if (body.section == "family") {
        let familyDetailsbody = {
          "clientID": id,
          "familyStatus": body?.familyStatus,
          "familyValues": body?.familyValues,
          "familyType": body?.familyType,
          "familyIncome": body?.familyIncome,
          "fatherOccupation": body?.fatherOccupation,
          "motherOccupation": body?.motherOccupation,
          "brothers": body?.brothers,
          "marriedBrothers": body?.marriedBrothers,
          "sisters": body?.sisters,
          "marriedSisters": body?.marriedSisters,
          "gothra": body?.gothra,
          "livingWithParents": body?.livingWithParents,
          "familyBasedOutOf": body?.familyBasedOutOf,
          "aboutMyFamily": body?.aboutMyFamily
        }
        let updateData = await familySchema.updateOne({ "clientID": id }, familyDetailsbody, { upsert: true })
      }
      else if (body.section == "contact") {
        let contactDetailsbody = {
          "email": body?.email,
          "alternateEmail": body?.alternateEmail,
          "altMobileNumber": body?.altMobileNumber,
          "landline": body?.landline
        }
        let updateData = await userSchema.updateOne({ "_id": id }, contactDetailsbody)
      }
      else if (body.section == "horoscope") {
        let kundaliDetailsbody = {
          "rashi": body?.rashi,
          "nakshatra": body?.nakshatra,
          "manglik": body?.manglik,
          "horoscope": body?.horoscope,
          "countryOfBirth": body?.countryOfBirth,
          "cityOfBirth": body?.cityOfBirth,
          "stateOfBirth": body?.stateOfBirth,
          "timeOfBirth": body?.timeOfBirth,
        }
        let updateData = await personalDetailsSchema.updateOne({ "clientID": id }, kundaliDetailsbody)
      }
      else if (body.section == "lifestyle") {
        let lifestyleDetailsbody = {
          "clientID": id,
          "habits": body?.habits,
          "assets": body?.assets,
          "movies": body?.movies,
          "languages": body?.languages,
          "foodICook": body?.foodICook,
          "hobbies": body?.hobbies,
          "interest": body?.interest,
          "books": body?.books,
          "dress": body?.dress,
          "sports": body?.sports,
          "cuisine": body?.cuisine,
          "favRead": body?.favRead,
          "favTVShow": body?.favTVShow,
          "vacayDestination": body?.vacayDestination,
          "dietaryHabits": body?.dietaryHabits,
          "drinkingHabits": body?.drinkingHabits,
          "smokingHabits": body?.smokingHabits,
          "openToPets": body?.openToPets,
          "ownAHouse": body?.ownAHouse,
          "ownACar": body?.ownACar,
          "foodICook": body?.foodICook,
          "favMusic": body?.favMusic,
        }
        let updateData = await lifestyleSchema.updateOne({ "clientID": id }, lifestyleDetailsbody, { upsert: true })
      }
      else {
        throw new Error("Invalid section type.");
      }
      return res.send({
        code: "CH200",
        status: "success",
        message: "User details updated successfully.",
      });
    } catch (e) {
      console.log(e)
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e?.message ? e?.message : e
      });
    }
  },
  getUserProfileData: async (req, res) => {
    try {
      let id = req.userId;
      //console.log({id})
      let userData = await userSchema.findById(id);
      let familyData = await familySchema.findOne({ "clientID": id });
      let lifeStyleData = await lifestyleSchema.findOne({ "clientID": id });
      let personalDetailsData = await personalDetailsSchema.findOne({ "clientID": id });
      let result = {
        "miscellaneous":{
          "country":personalDetailsData?.country,
          "state":personalDetailsData?.state,
          "residentialStatus": personalDetailsData?.residentialStatus,
          "city":personalDetailsData?.city,
          "heartsId":userData?.heartsId,
          "profilePic": userData?.profilePic
        },
        "basic": {
          "cast": personalDetailsData?.cast,
          "height": personalDetailsData?.height,
          "country": personalDetailsData?.country,
          "state": personalDetailsData?.state,
          "city": personalDetailsData?.city,
          "religion": personalDetailsData?.religion,
          "residentialStatus": personalDetailsData?.residentialStatus,
          "name":userData?.name,
          "gender":userData?.gender,
          "income":personalDetailsData?.income,
          "motherTongue":personalDetailsData?.motherTongue
        },
        "critical": {
          "dob": personalDetailsData?.dob,
          "maritalStatus": personalDetailsData?.maritalStatus
        },
        "about": {
          "managedBy": personalDetailsData?.managedBy,
          "description": userData?.description,
          "disability": personalDetailsData?.disability,
          "bodyType": personalDetailsData?.bodyType,
          "thalassemia": personalDetailsData?.thalassemia,
          "hivPositive": personalDetailsData?.hivPositive
        },
        "education": {
          "qualification": personalDetailsData?.education?.qualification,
          "otherUGDegree": personalDetailsData?.education?.otherUGDegree,
          "aboutEducation": personalDetailsData?.education?.aboutEducation,
          "school": personalDetailsData?.education?.school,
        },
        "career": {
          "aboutMyCareer": personalDetailsData?.aboutMyCareer,
          "employed_in": personalDetailsData?.employed_in,
          "occupation": personalDetailsData?.occupation,
          "organisationName": personalDetailsData?.organisationName,
          "interestedInSettlingAbroad": personalDetailsData?.interestedInSettlingAbroad,
        },
        "family": {
          "familyStatus": familyData?.familyStatus,
          "familyValues": familyData?.familyValues,
          "familyType": familyData?.familyType,
          "familyIncome": familyData?.familyIncome,
          "fatherOccupation": familyData?.fatherOccupation,
          "motherOccupation": familyData?.motherOccupation,
          "brothers": familyData?.brothers,
          "marriedBrothers": familyData?.marriedBrothers,
          "sisters": familyData?.sisters,
          "marriedSisters": familyData?.marriedSisters,
          "gothra": familyData?.gothra,
          "livingWithParents": familyData?.livingWithParents,
          "familyBasedOutOf": familyData?.familyBasedOutOf,
          "aboutMyFamily": familyData?.aboutMyFamily,
        },
        "contact": {
          "email": userData?.email,
          "phoneNumber": userData?.phoneNumber,
          "alternateEmail": userData?.alternateEmail,
          "altMobileNumber": userData?.altMobileNumber,
          "landline": userData?.landline,
        },
        "horoscope": {
          "rashi": personalDetailsData?.rashi,
          "nakshatra": personalDetailsData?.nakshatra,
          "manglik": personalDetailsData?.manglik,
          "horoscope": personalDetailsData?.horoscope,
          "countryOfBirth": personalDetailsData?.countryOfBirth,
          "stateOfBirth": personalDetailsData?.stateOfBirth,
          "cityOfBirth": personalDetailsData?.cityOfBirth,
          "timeOfBirth": personalDetailsData?.timeOfBirth
        },
        "lifeStyleData": {
          "habits": lifeStyleData?.habits,
          "assets": lifeStyleData?.assets,
          "movies": lifeStyleData?.movies,
          "languages": lifeStyleData?.languages,
          "foodICook": lifeStyleData?.foodICook,
          "hobbies": lifeStyleData?.hobbies,
          "interest": lifeStyleData?.interest,
          "books": lifeStyleData?.books,
          "dress": lifeStyleData?.dress,
          "sports": lifeStyleData?.sports,
          "cuisine": lifeStyleData?.cuisine,
          "favRead": lifeStyleData?.favRead,
          "favTVShow": lifeStyleData?.favTVShow,
          "vacayDestination": lifeStyleData?.vacayDestination,
          "dietaryHabits": lifeStyleData?.dietaryHabits,
          "drinkingHabits": lifeStyleData?.drinkingHabits,
          "smokingHabits": lifeStyleData?.smokingHabits,
          "openToPets": lifeStyleData?.openToPets,
          "ownAHouse": lifeStyleData?.ownAHouse,
          "ownACar": lifeStyleData?.ownACar,
          "foodICook": lifeStyleData?.foodICook,
          "favMusic": lifeStyleData?.favMusic,
        }
      }
      return res.send({
        code: "CH200",
        status: "success",
        data: result,
      });
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
