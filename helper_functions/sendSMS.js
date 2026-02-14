const axios = require("axios");

const triggerSMS = async (phoneNumber, body) => {
    try {
        // Remove country code prefix if present (e.g., +91)
        let cleanPhoneNumber = phoneNumber.replace(/^\+/, '');
        
        // Extract country code and mobile number
        let countryCode = '91'; // Default to India
        let mobileNumber = cleanPhoneNumber;
        
        if (cleanPhoneNumber.startsWith('91') && cleanPhoneNumber.length > 10) {
            countryCode = '91';
            mobileNumber = cleanPhoneNumber.substring(2);
        }
        
        // Build the SMS API URL with DigiCoders parameters
        let url = `${process.env.SMS_API_URL}?authkey=${process.env.SMS_AUTH_KEY}&mobiles=${countryCode}${mobileNumber}&message=${encodeURIComponent(body)}&sender=${process.env.SMS_SENDER}&route=${process.env.SMS_ROUTE}&country=${countryCode}&DLT_TE_ID=${process.env.SMS_DLT_TEMPLATE_ID}`;
        
        console.log("SMS URL is", url);
        
        const smsResp = await axios.get(url);
        console.log("SMS Response:", smsResp.data);
        
        // Check for successful response
        if (smsResp?.data) {
            return { smsResp, status: 'success' };
        } else {
            console.log("SMS Error:", smsResp);
            throw new Error({ error: smsResp, status: 'error' });
        }
    } catch (error) {
        console.log("SMS Trigger Error:", error);
        throw new Error({ error, status: 'error' });
    }
}

module.exports = { triggerSMS };