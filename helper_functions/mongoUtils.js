const { ObjectId } = require('mongodb');

module.exports = {
      isValidMongoId: (id) => {
            try {
                  const objectId = new ObjectId(id);
                  // Check if the string representation of the ObjectId matches the input string
                  return objectId.toString() === id;
            } catch (error) {
                  return false;
            }
      }
}