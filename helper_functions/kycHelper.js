const axios = require("axios");

// Authenticate and get access token
const authenticate = async () => {
    try {
        const response = await axios.post(
            'https://api.sandbox.co.in/authenticate',
            {},
            {
                headers: {
                    'x-api-key': process.env.SANDBOX_API_KEY,
                    'x-api-secret': process.env.SANDBOX_API_SECRET,
                    'x-api-version': '1.0'
                }
            }
        );
        
        if (response?.data?.data?.access_token) {
            return response.data.data.access_token;
        } else {
            throw new Error('Failed to get access token');
        }
    } catch (error) {
        console.log('Authentication Error:', error.response?.data || error.message);
        throw error;
    }
};

// Generate OTP for Aadhaar verification
const generateAadhaarOTP = async (aadhaarNumber) => {
    try {
        console.log("Authenticating for Aadhaar OTP generation...");
        const accessToken = await authenticate();
        console.log("Access token received:", accessToken ? "Yes" : "No");
        
        const requestBody = {
            "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
            "aadhaar_number": aadhaarNumber,
            "consent": "Y",
            "reason": "User verification for ConnectingHeart matrimonial platform"
        };
        
        console.log("Generating OTP for Aadhaar:", aadhaarNumber);
        console.log("Request Body:", JSON.stringify(requestBody, null, 2));
        
        const response = await axios.post(
            'https://api.sandbox.co.in/kyc/aadhaar/okyc/otp',
            requestBody,
            {
                headers: {
                    'Authorization': accessToken,
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.SANDBOX_API_KEY,
                    'x-api-version': '1.0'
                }
            }
        );
        
        console.log("Generate OTP Success Response:", JSON.stringify(response.data, null, 2));
        
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.log('Generate OTP Error - Status:', error.response?.status);
        console.log('Generate OTP Error - Data:', JSON.stringify(error.response?.data, null, 2));
        console.log('Generate OTP Error - Message:', error.message);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
};

// Verify OTP and get Aadhaar details
const verifyAadhaarOTP = async (referenceId, otp) => {
    try {
        const accessToken = await authenticate();
        
        // Convert referenceId to string if it's a number
        const refIdString = String(referenceId);
        
        console.log("Verifying with referenceId:", refIdString, "OTP:", otp);
        
        const response = await axios.post(
            'https://api.sandbox.co.in/kyc/aadhaar/okyc/otp/verify',
            {
                "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
                "reference_id": refIdString,
                "otp": otp
            },
            {
                headers: {
                    'Authorization': accessToken,
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.SANDBOX_API_KEY,
                    'x-api-version': '1.0'
                }
            }
        );
        
        console.log("Verify OTP Success Response:", JSON.stringify(response.data, null, 2));
        
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.log('Verify OTP Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
};

module.exports = {
    generateAadhaarOTP,
    verifyAadhaarOTP
};
