const mongoose = require('mongoose');
// const  MONGO_URI = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}`; // Environment variable for your MongoDB URI
const MONGO_URI = 'mongodb+srv://codeconnect123:codeconnect123@cluster0.ocxugzh.mongodb.net/connectinghearts?retryWrites=true&w=majority';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB', error);
  });
