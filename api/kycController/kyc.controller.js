const kycHelper = require("../../helper_functions/kycHelper");
const userSchema = require("../../schemas/user.schema");
const validationFunc = require("../../helper_functions/validateBody");

module.exports = {
  // Generate OTP for Aadhaar verification
  generateKycOtp: async (req, res) => {
    try {
      let keys = ["aadhaarNumber"];
      let body = req.body;
      
      if (!validationFunc.validateBody(keys, body)) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Invalid body. Please provide aadhaarNumber.",
        });
      }

      // Validate Aadhaar number format (12 digits)
      if (!/^\d{12}$/.test(body.aadhaarNumber)) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Invalid Aadhaar number. Must be 12 digits.",
        });
      }

      // Check if user is from India (+91)
      let user = await userSchema.findById(req.userId).select({ countryCode: 1 });
      if (!user) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "User not found.",
        });
      }

      if (user.countryCode !== "+91") {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "KYC verification is only available for Indian users.",
        });
      }

      // Generate OTP
      const result = await kycHelper.generateAadhaarOTP(body.aadhaarNumber);
      
      if (result.success) {
        return res.send({
          code: "CH200",
          status: "success",
          message: "OTP sent successfully to Aadhaar registered mobile number.",
          referenceId: result.data?.data?.reference_id,
          transactionId: result.data?.transaction_id
        });
      } else {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: result.error?.message || "Failed to generate OTP. Please try again.",
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message || "Unable to generate KYC OTP. Please contact admin.",
      });
    }
  },

  // Verify OTP and complete KYC
  verifyKycOtp: async (req, res) => {
    try {
      let keys = ["referenceId", "otp"];
      let body = req.body;
      
      if (!validationFunc.validateBody(keys, body)) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "Invalid body. Please provide referenceId and otp.",
        });
      }

      console.log("Verifying KYC OTP with:", { referenceId: body.referenceId, otp: body.otp });

      // Verify OTP
      const result = await kycHelper.verifyAadhaarOTP(body.referenceId, body.otp);
      
      console.log("KYC Verification Result:", JSON.stringify(result, null, 2));

      if (result.success && result.data?.data?.status === "VALID") {
        // Save KYC data to user
        const kycData = {
          name: result.data.data.name,
          dateOfBirth: result.data.data.date_of_birth,
          gender: result.data.data.gender,
          address: result.data.data.full_address,
          addressDetails: result.data.data.address,
          careOf: result.data.data.care_of,
          verifiedAt: new Date(),
          transactionId: result.data.transaction_id,
          referenceId: body.referenceId
        };

        await userSchema.findByIdAndUpdate(req.userId, {
          kycStatus: 'verified',
          kycData: kycData
        });

        return res.send({
          code: "CH200",
          status: "success",
          message: "KYC verification completed successfully!",
          kycData: {
            name: kycData.name,
            dateOfBirth: kycData.dateOfBirth,
            gender: kycData.gender,
            address: kycData.address
          }
        });
      } else {
        // Update KYC status to failed
        await userSchema.findByIdAndUpdate(req.userId, {
          kycStatus: 'failed'
        });

        console.log("KYC Verification Failed - Full Error:", result);

        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: result.data?.data?.message || result.error?.message || "OTP verification failed. Please try again.",
          details: result.error || result.data
        });
      }
    } catch (e) {
      console.log("KYC Verify OTP Exception:", e);
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message || "Unable to verify KYC OTP. Please contact admin.",
      });
    }
  },

  // Get KYC status
  getKycStatus: async (req, res) => {
    try {
      let user = await userSchema.findById(req.userId).select({ 
        kycStatus: 1, 
        'kycData.name': 1,
        'kycData.dateOfBirth': 1,
        'kycData.gender': 1,
        'kycData.address': 1,
        'kycData.verifiedAt': 1
      });

      if (!user) {
        return res.status(400).send({
          code: "CH400",
          status: "failed",
          err: "User not found.",
        });
      }

      return res.send({
        code: "CH200",
        status: "success",
        kycStatus: user.kycStatus,
        kycData: user.kycData || {}
      });
    } catch (e) {
      console.log(e);
      return res.status(400).send({
        code: "CH400",
        status: "failed",
        err: e.message || "Unable to get KYC status.",
      });
    }
  }
};
