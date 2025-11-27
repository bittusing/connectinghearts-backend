const generateDOB = (age) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const birthYear = currentYear - age;
  const dob = new Date(
    birthYear,
    currentDate.getMonth(),
    currentDate.getDate()
  );
  return dob;
};
module.exports = { generateDOB };
