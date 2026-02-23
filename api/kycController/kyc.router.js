const express = require('express');
const router = express.Router();
const kycController = require('./kyc.controller');
const auth = require('../../middlewares/auth');

// Generate OTP for Aadhaar verification
router.post('/generate-otp', auth.protectedRoute, kycController.generateKycOtp);

// Verify OTP and complete KYC
router.post('/verify-otp', auth.protectedRoute, kycController.verifyKycOtp);

// Get KYC status
router.get('/status', auth.protectedRoute, kycController.getKycStatus);

module.exports = router;
