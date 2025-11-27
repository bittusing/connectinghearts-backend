const sgMail = require('@sendgrid/mail');
const sendEmail = async (to, text) => {
  sgMail.setApiKey(process.env.SEND_GRID_API_KEY)
  const msg = {
    to, // Change to your recipient
    from: process.env.SEND_GRID_VERIFIED_SENDER, // Change to your verified sender
    subject: 'Welcome to connecting hearts!!',
    text,
    // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  }
  try {
    let emailShoot = await sgMail.send(msg);
    return { status: 'success', data: emailShoot }
  }
  catch (err) {
    console.log(err)
    throw new Error({ status: 'error', data: err });
  }
}
module.exports = { sendEmail };