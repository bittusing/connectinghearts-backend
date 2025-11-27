const generateOtp = () => {
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number

  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  //console.log("==",process.env.IS_PROD)
  return randomNumber;
  // return process.env.IS_PROD=="TRUE"?randomNumber : 589987;
};
module.exports = { generateOtp };
