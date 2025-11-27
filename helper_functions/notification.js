const admin = require('firebase-admin');
const userSchema = require("../schemas/user.schema")


module.exports = {
    sendNotificationToUser: async (userId, title, body) => {
        let userData = await userSchema.findById(userId).select({ "fcmToken": 1, "_id": 0 });
        if(!userData?.fcmToken){
            return "FCM token not found."
        }
        let msg = {
            notification: {
                title,
                body
            },
            token: userData?.fcmToken,
        };
        try {
            let message = await admin.messaging().send(msg);
            return message;
        }
        catch (e) {
            console.log(e)
            await userSchema.findByIdAndUpdate(userId,{fcmToken:null})
            return "failed";
        }
    }
}