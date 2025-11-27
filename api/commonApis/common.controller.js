let lookupSchema = require("../../schemas/lookup.schema");
let countrySchema = require("../../schemas/country.schema.js");
let stateSchema = require("../../schemas/state.schema.js");
let citySchema = require("../../schemas/city.schema.js");
let personalDetailsSchema = require("../../schemas/personalDetails.schema");
let jsonConverter = require("../../helper_functions/jsonConverter.js")
let { s3Download, s3ListAllKeys } = require("../../helper_functions/s3Helper.js")
let path = require("path")
let fs = require("fs")
let logger = require("../../helper_functions/logger")
// let validationFunc = require("../../helper_functions/validateBody");

module.exports = {
  getLookup: async (req, res) => {
    //console.log("hit");
    try {
      let user = await personalDetailsSchema.findOne({ "clientID": req.userId }).select({ _id: 0, "country": 1 });
      let lookupData = await lookupSchema.find().select({ _id: 0 }).lean();
      if (user?.country && user?.country != "Ind_101") {
        lookupData[0].income = lookupData[0].usdIncome;
      }
      console.log(lookupData)
      delete lookupData[0].usdIncome;
      return res.send({
        code: "CH200",
        status: "success",
        message: "Lookup fetched successfully!",
        lookupData: req.query.type == "hashmap" ? jsonConverter.convertJson(lookupData) : lookupData
      })
    } catch (err) {
      console.log('err: ', err);
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err,
      });
    }
  },
  getCountryLookup: async (req, res) => {
    try {
      console.log(req.query)
      let countries = await countrySchema.find().select({ _id: 0 });
      return res.send(req.query.type == "hashmap" ? jsonConverter.hashMapifyLabelValue(countries) : countries);
    } catch (e) {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : "Unable to fetch countries",
      });
    }

  },
  getIncomeLookup: async (req, res) => {
    try {
      let user = await userSchema.findOne({ "clientID": req.userId }).select({ _id: 0, "country": 1 });
      let lookupData = await lookupSchema.find().select({ _id: 0 }).lean();
      if (user.country != "Ind_101") {
        lookupData.income = lookupData.usdIncome;
      }
    } catch (e) {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : "Unable to fetch incomes",
      });
    }
  },
  getStateLookup: async (req, res) => {
    try {
      let country_id = req.params.countryId;
      //console.log({ country_id })
      let states = await stateSchema.find({ country_id }).select({ _id: 0 }).lean();
      if (req.query.type == "hashmap") {
        let convertedStates = jsonConverter.hashMapifyLabelValue(states[0].states);
        states[0].states = convertedStates;
        return res.send(states)
      }
      return res.send(states)
    } catch (e) {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : "Unable to fetch states",
      });
    }

  },
  getCityLookup: async (req, res) => {
    try {
      let state_id = req.params.stateId;
      let cities = await citySchema.find({ state_id }).select({ _id: 0 }).lean();
      if (req.query.type == "hashmap") {
        let convertedCities = jsonConverter.hashMapifyLabelValue(cities[0].cities);
        cities[0].cities = convertedCities;
        return res.send(cities)
      }
      return res.send(cities);
    } catch (e) {
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message ? e.message : "Unable to fetch cities",
      });
    }
  },
  downloadAllS3Images: async (req, res) => {
    try {
      const bucketName = req.body?.bucketName || req.query?.bucketName;
      const prefix = req.body?.prefix || req.query?.prefix;
      if (!bucketName) {
        return res.status(400).send({ code: "CH400", status: "failed", err: "bucketName required" });
      }
      logger({ event: "s3_download_start", bucketName, prefix: prefix || null });
      const keys = await s3ListAllKeys(bucketName, prefix);
      const imageKeys = keys.filter(k => /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(k));
      logger({ event: "s3_download_keys_filtered", totalKeys: keys.length, imageKeys: imageKeys.length });
      const assetsDir = path.resolve(process.cwd(), "assets");
      if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
      const files = [];
      for (let i = 0; i < imageKeys.length; i++) {
        const key = imageKeys[i];
        logger({ event: "s3_downloading_object", index: i + 1, total: imageKeys.length, key });
        const obj = await s3Download(key, bucketName);
        const base = path.basename(key);
        const filePath = path.join(assetsDir, base);
        await fs.promises.writeFile(filePath, obj.Body);
        files.push(filePath);
      }
      logger({ event: "s3_download_complete", downloaded: files.length });
      return res.send({ code: "CH200", status: "success", message: "Downloaded images", count: files.length, files });
    } catch (e) {
      logger({ event: "s3_download_error", error: e.message });
      return res.status(500).send({ code: "CH500", status: "failed", err: e.message ? e.message : "Unable to download images" });
    }
  }
}