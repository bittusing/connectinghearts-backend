// const twilio = require('twilio');
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = twilio(accountSid, authToken);
const axios = require("axios");

const triggerSMS =async (phoneNumber,body) =>{
    try {
        // const message = await client.messages.create({
        //   body,
        //   from: process.env.TWILIO_PHONE_NUMBER,
        //   to: "whatsapp:"+phoneNumber
        // });
        let url=`${process.env.SMS_API_URL}?api_id=${process.env.SMS_API_ID}&api_password=${process.env.SMS_API_PASSWORD}
        &sms_type=${process.env.SMS_TYPE}&sms_encoding=text&sender=${process.env.SMS_SENDER}
        &number=${phoneNumber}&message=${body}&template_id=${process.env.SMS_TEMPLATE_ID}`
        console.log("SMS URL is",url)
        const smsResp = await axios.get(url);
        // console.log(smsResp.data)
        if(smsResp?.data?.code==200){
          return {smsResp,status:'success'};
        }
        else{
          console.log(smsResp)
          throw new Error({error:smsResp,status:'error'})
        }
      } catch (error) {
        console.log(error)
        throw new Error({error,status:'error'})
        // return {message,status:'success'};
      }
}
module.exports={triggerSMS}