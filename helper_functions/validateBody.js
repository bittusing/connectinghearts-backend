
const validateBody = (keys,obj_body) =>{
    for (let i = 0; i < keys.length; i++) {
        if (!(keys[i] in obj_body)) {
          return false; // Key is missing in the object
        }
      }
      return true; // All keys are present in the object
}
module.exports = {validateBody};