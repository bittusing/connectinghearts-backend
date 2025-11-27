const userSchema = require("../schemas/user.schema");
const personalDetailsSchema = require("../schemas/personalDetails.schema");
const _ = require("lodash");
const interestSchema = require("../schemas/interest.schema");
const notificationSchema = require("../schemas/notification.schema");
module.exports = {
    getListView: async (ids, currentUserId, flag, ignoreBlock, ignoreDeclinedProfiles, ignoreShuffling) => {
        try {
            if (flag != "ignoreInterestData") {
                let interestData = await interestSchema.find({ "requester_id": currentUserId }).lean().select({ "receiver_id": 1 });
                const filteredIds = [];
                for (let i = 0; i < ids.length; i++) {
                    let shouldKeep = true;
                    for (let j = 0; j < interestData.length; j++) {
                        if (interestData[j]?.receiver_id.toString() === ids[i].toString()) {
                            shouldKeep = false;
                            break;
                        }
                    }
                    if (shouldKeep) {
                        filteredIds.push(ids[i].toString());
                    }
                }
                ids = [...filteredIds];
            }
            if (!ignoreDeclinedProfiles) {
                let interestData = await interestSchema.find({ "receiver_id": currentUserId }).lean().select({ "requester_id": 1, "status": 1 });
                // ids = ids.filter(id => !interestData.some(data => data.requester_id.toString() === id && data.status === "reject"));
                const filteredIds = [];
                for (let i = 0; i < ids.length; i++) {
                    let shouldKeep = true;
                    for (let j = 0; j < interestData.length; j++) {
                        if (interestData[j]?.requester_id.toString() === ids[i] && interestData[j].status === "reject") {
                            shouldKeep = false;
                            break;
                        }
                    }
                    if (shouldKeep) {
                        filteredIds.push(ids[i]);
                    }
                }
                ids = [...filteredIds];

            }
            console.log({currentUserId})
            let currentUserData = await userSchema.findById(currentUserId).select({ blockList: 1, ignoreList: 1, memberShipExpiryDate: 1, shortlistedProfiles: 1 });
            let block_query = { clientID: { $nin: currentUserData?.blockList } }
            let personalData = await personalDetailsSchema.find({
                // "isDeleted":false,
                $and: [
                    { clientID: { $in: ids } },
                    ignoreBlock ? {} : block_query
                ]
            }).lean().select({ "clientID": 1, "dob": 1, "cast": 1, "height": 1, "city": 1, "_id": 0, "state": 1, "country": 1, "income": 1 });
            let filteredPersonalData = [];
            const clientIDs = personalData.map(item => item.clientID);

            // Fetch user data for all client IDs in a single query
            const userDataList = await userSchema.find({ "_id": { $in: clientIDs } })
                .select({ heartsId: 1, profilePic: 1, blockList: 1, isVerified: 1 });

            // Create a map for quicker lookup of user data by clientID
            const userDataMap = {};
            userDataList.forEach(userData => {
                userDataMap[userData._id.toString()] = userData;
            });

            // Now, you can process personalData
            filteredPersonalData = personalData
                .filter(item => {
                    const userData = userDataMap[item.clientID];

                    if (userData?.blockList.indexOf(currentUserId) >= 0 || !userData?.isVerified) {
                        return false;
                    }

                    item.heartsId = userData.heartsId;
                    item.profilePic = userData.profilePic;
                    item.isMembershipActive = new Date().getTime() < new Date(currentUserData?.memberShipExpiryDate).getTime();

                    if (currentUserData?.shortlistedProfiles?.indexOf(item.clientID) > -1) {
                        item.isShortlisted = true;
                    } else {
                        item.isShortlisted = false;
                    }

                    return true;
                });
            // for (let i = 0; i < personalData.length; i++) {//this can be optimised
            //     let userData = await userSchema.findOne({ "_id": personalData[i].clientID }).select({ heartsId: 1, profilePic: 1, blockList: 1, isVerified: 1 });
            //     if (userData?.blockList.indexOf(currentUserId) >= 0 || !userData?.isVerified) {
            //         // personalData.splice(i, 1);
            //         continue;
            //     }
            //     // //console.log("=========",personalData[i].clientID)
            //     if (userData) {
            //         // personalData[i] = personalData[i].toObject();
            //         personalData[i].heartsId = userData.heartsId;
            //         personalData[i].profilePic = userData.profilePic;
            //         personalData[i].isMembershipActive = new Date().getTime() < new Date(currentUserData?.memberShipExpiryDate).getTime();
            //         if (currentUserData?.shortlistedProfiles?.indexOf(personalData[i].clientID) > -1) {
            //             personalData[i].isShortlisted = true;
            //         }
            //         else {
            //             personalData[i].isShortlisted = false;
            //         }
            //         filteredPersonalData.push(personalData[i]);
            //         // "isMembershipActive": new Date().getTime() < new Date(requesterUserData?.memberShipExpiryDate).getTime()
            //         // personalData[i].isVerified = userData.isVerified;
            //     } else {
            //         //console.log(`No userData found for clientID ${personalData[i].clientID}`);
            //     }
            // }
            if (!ignoreShuffling) {
                finalPersonalData = _.shuffle(filteredPersonalData);
            }
            else {
                finalPersonalData = filteredPersonalData;
            }
            let matchingElems = finalPersonalData.filter(item => currentUserData?.ignoreList?.includes(item.clientID));
            let unMatchingElems = finalPersonalData.filter(item => !currentUserData?.ignoreList?.includes(item.clientID));
            finalPersonalData = unMatchingElems.concat(matchingElems);
            return finalPersonalData;
        } catch (error) {
            console.error("Error in getListView:", error);
            throw error; // Rethrow the error to be handled by the caller
        }
    },
    getNotificationCount: async (filteredProfiles, currId, type) => {
        let notificationData = await notificationSchema.findOne({ "clientID": currId, type });
        let count = filteredProfiles.length;
        for (let j = 0; j < filteredProfiles?.length; j++) {
            for (let i = 0; i < notificationData?.ids?.length; i++) {
                if (notificationData?.ids[i] == filteredProfiles[j]?.clientID) {
                    count--;
                }
            }
        }
        return count;
    }

}

