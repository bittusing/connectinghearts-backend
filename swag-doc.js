module.exports = {
    /**
     * @swagger
     * components:
     *   securitySchemes:
     *     bearerAuth:
     *       type: http
     *       scheme: bearer
     */
    /**
     * @swagger
     * /api/auth/generateOtp:
     *   post:
     *     summary: API for generating OTP
     *     tags: [Auth APIs]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               phoneNumber:
     *                 type: string
     *                 example: "9999942496"
     *               extension:
     *                 type: string
     *                 example: "+91"
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/auth/verifyOTP:
     *   post:
     *     summary: API for verifying OTP
     *     tags: [Auth APIs]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               phoneNumber:
     *                 type: string
     *                 example: "9999942496"
     *               otp:
     *                 type: number
     *                 example: 119562
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/auth/signup:
     *   post:
     *     summary: API for user signup
     *     tags: [Auth APIs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 example: "johndoe@test.com"
     *               password:
     *                 type: string
     *                 example: "test@123"
     *               confirm_password:
     *                 type: string
     *                 example: "test@123"
     *               name:
     *                 type: string
     *                 example: "John Doe"
     *               fcmToken:
     *                 type: string
     *                 example: "faeqfjrekfongijrtbivb"
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: API for user login
     *     tags: [Auth APIs]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               phoneNumber:
     *                 type: string
     *                 example: "9999942496"
     *               password:
     *                 type: string
     *                 example: "Hello@123"
     *               fcmToken:
     *                 type: string
     *                 example: "cvfevrf"
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/auth/getUser:
     *   get:
     *     summary: API for retrieving user information
     *     tags: [Auth APIs]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/auth/validateToken:
     *   get:
     *     summary: API for validating the token
     *     tags: [Auth APIs]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
   /**
     * @swagger
     * /api/auth/updateLastActiveScreen/{screenName}:
     *   patch:
     *     summary: API for updating last active screen.
     *     tags: [Auth APIs]
     *     parameters:
     *       - in: path
     *         name: screenName
     *         required: true
     *         schema:
     *           type: string
     *           description: Name of the screen last used by the user.
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
    */
    /**
     * @swagger
     * /api/lookup/s3/downloadAll:
     *   post:
     *     summary: Download all images from an S3 bucket to server assets folder
     *     tags: [Lookup APIs]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               bucketName:
     *                 type: string
     *                 example: "your-bucket"
     *     responses:
     *       '200':
     *         description: Download completed
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
   /**
     * @swagger
     * /api/auth/checkUpdate/{version_number}:
     *   get:
     *     summary: API for checking the latest app version.
     *     tags: [Auth APIs]
     *     parameters:
     *       - in: path
     *         name: version_number
     *         required: true
     *         schema:
     *           type: string
     *           description: Current version number of the app.
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
    */
    /**
     * @swagger
     * /api/auth/changePassword:
     *   patch:
     *     summary: API for changing the password.
     *     tags: [Auth APIs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               current_password:
     *                 type: string
     *                 example: "Hello@123"
     *               new_password:
     *                 type: string
     *                 example: "Admin@123"
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
   /**
     * @swagger
     * /api/auth/forgetPassword/{phoneNumber}:
     *   get:
     *     summary: API for fetching the OTP for resetting password.
     *     tags: [Auth APIs]
     *     parameters:
     *       - in: path
     *         name: phoneNumber
     *         required: true
     *         schema:
     *           type: string
     *           description: Phone number of the user whose password needs to be reset.
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
    */
    /**
     * @swagger
     * /api/auth/verifyForgottenOTP:
     *   post:
     *     summary: API for verifying the OTP for changing password.
     *     tags: [Auth APIs]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               phoneNumber:
     *                 type: string
     *                 example: "9999942496"
     *               otp:
     *                 type: string
     *                 example: "111111"
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/auth/updateForgottenPassword:
     *   post:
     *     summary: API for updating the password.
     *     tags: [Auth APIs]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               password:
     *                 type: string
     *                 example: "Hello@123"
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/auth/deleteProfile:
     *   delete:
     *     summary: API for deleting a profile
     *     tags: [Auth APIs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               reasonForDeletion:
     *                 type: number
     *                 example: 1
     *               deletionComment:
     *                 type: string
     *                 example: "I have some personal reasons"
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/personalDetails:
     *   patch:
     *     summary: API for updating personal details of a user
     *     tags: [Personal Details APIs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               gender:
     *                 type: string
     *                 example: "M"
     *               dob:
     *                 type: number
     *                 example: 769194509000
     *               height:
     *                 type: number
     *                 example: 72
     *               employed_in:
     *                 type: string
     *                 example: "pvtSct"
     *               country:
     *                 type: string
     *                 example: "Ind_101"
     *               city:
     *                 type: string
     *                 example: "Ghaz10133204"
     *               motherTongue:
     *                 type: string
     *                 example: "Hind9"
     *               religion:
     *                 type: string
     *                 example: "hin"
     *               cast:
     *                 type: string
     *                 example: "Hind01"
     *               horoscope:
     *                 type: string
     *                 example: "TA"
     *               manglik:
     *                 type: string
     *                 example: "non"
     *               income:
     *                 type: number
     *                 example: 11
     *               residentialStatus:
     *                 type: string
     *                 example: "Perm2"
     *               maritalStatus:
     *                 type: string
     *                 example: "nvm"
     *               occupation:
     *                 type: string
     *                 example: "Acco0"
     *               haveChildren:
     *                 type: string
     *                 example: "N"
     *               castNoBar:
     *                 type: boolean
     *                 example: true
     *               education:
     *                   type: object
     *                   properties:
     *                       qualification:
     *                           type: string
     *                           example: "Btech"
     *                       otherUGDegree:
     *                         type: string
     *                         example: "ME"
     *               
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/personalDetails/editProfile:
     *   patch:
     *     summary: API for editing the user.
     *     tags: [Personal Details APIs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               section:
     *                 type: string
     *                 example: "basic"
     *                 required: true
     *               cast:
     *                 type: string
     *                 example: "basic"
     *               height:
     *                 type: number
     *                 example: 72
     *               state:
     *                 type: string
     *                 example: "basic"           
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
   /**
     * @swagger
     * /api/personalDetails/getUserProfileData/:
     *   get:
     *     summary: API for getting user details for edit.
     *     tags: [Personal Details APIs]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
    */
   /**
     * @swagger
     * /api/dashboard/getDetailView/{target_user_id}:
     *   get:
     *     summary: API for viewing the user.
     *     tags: [Personal Details APIs]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: target_user_id
     *         required: true
     *         schema:
     *           type: string
     *           description: ClientID of the user who user wants to access.
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
    */
    /**
     * @swagger
     * /api/personalDetails:
     *   get:
     *     summary: API for retrieving personal details of a user
     *     tags: [Personal Details APIs]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/srcmDetails:
     *   get:
     *     summary: API for retrieving SRCM details of a user
     *     tags: [SRCM APIs]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/srcmDetails/updateSrcmDetails:
     *   patch:
     *     summary: API for updating SRCM details of a user
     *     tags: [SRCM APIs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               srcmIdNumber:
     *                 type: string
     *                 example: "64e447c453a6d21b4fe05a1e"
     *               satsangCentreName:
     *                 type: string
     *                 example: "Test name"
     *               preceptorsName:
     *                 type: string
     *                 example: "Test"
     *               preceptorsContactNumber:
     *                 type: string
     *                 example: "9999988888"
     *               preceptorsEmail:
     *                 type: string
     *                 example: "johndoe@test.com"
     *               srcmIdFilename:
     *                 type: string
     *                 example: "1690539477142-test_pic.PNG"
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
   /**
     * @swagger
     * /api/srcmDetails/file/{filename}:
     *   get:
     *     summary: API for retrieving SRCM ID card file
     *     tags: [SRCM APIs]
     *     parameters:
     *       - in: path
     *         name: filename
     *         required: true
     *         schema:
     *           type: string
     *           description: The name of the file to retrieve
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
    */
    /**
     * @swagger
     * paths:
     *   /api/srcmDetails/uploadSrcmId:
     *     post:
     *       summary: API for uploading SRCM ID card
     *       tags: [SRCM APIs]
     *       requestBody:
     *         required: true
     *         content:
     *           multipart/form-data:
     *             schema:
     *               type: object
     *               properties:
     *                 srcmPhoto:
     *                   type: string
     *                   format: binary
     *       security:
     *         - bearerAuth: []
     *       responses:
     *         '200':
     *           description: Successful response
     *           content:
     *             application/json: {}
     *         '400':
     *           description: Bad request
     *           content:
     *             application/json: {}
     *         '401':
     *           description: Unauthorised
     *           content:
     *             application/json: {}
     */
    /**
         * @swagger
         * paths:
         *   /api/profile/uploadProfilePic:
         *     post:
         *       summary: API for uploading profile pic
         *       tags: [Profile APIs]
         *       requestBody:
         *         required: true
         *         content:
         *           multipart/form-data:
         *             schema:
         *               type: object
         *               properties:
         *                 profilePhoto:
         *                   type: string
         *                   format: binary
         *                 primary:
         *                   type: boolean
         *                   example: true
         *  
         *       security:
         *         - bearerAuth: []
         *       responses:
         *         '200':
         *           description: Successful response
         *           content:
         *             application/json: {}
         *         '400':
         *           description: Bad request
         *           content:
         *             application/json: {}
         *         '401':
         *           description: Unauthorised
         *           content:
         *             application/json: {}
         */
    /**
         * @swagger
         * /api/profile/file/{userId}/{fileId}:
         *   get:
         *     summary: API for retrieving profile pic
         *     tags: [Profile APIs]
         *     parameters:
         *       - in: path
         *         name: userId
         *         required: true
         *         schema:
         *           type: string
         *           description: User ID
         *       - in: path
         *         name: fileId
         *         required: true
         *         schema:
         *           type: string
         *           description: File ID
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       '200':
         *         description: Successful response
         *         content:
         *           application/json: {}
         *       '400':
         *         description: Bad request
         *         content:
         *           application/json: {}
         *       '401':
         *         description: Unauthorised
         *         content:
         *           application/json: {}
        */
    /**
         * @swagger
         * /api/profile/deleteProfilePic/{id}:
         *   delete:
         *     summary: API for deleting user's profile pic
         *     tags: [Profile APIs]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *           description: The ID of the file to retrieve
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       '200':
         *         description: Successful response
         *         content:
         *           application/json: {}
         *       '400':
         *         description: Bad request
         *         content:
         *           application/json: {}
         *       '401':
         *         description: Unauthorised
         *         content:
         *           application/json: {}
        */
    /**
     * @swagger
     * /api/profile:
     *   patch:
     *     summary: API for updating profile pic & about me of a user
     *     tags: [Profile APIs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               description:
     *                 type: string
     *                 example: "I am awesome"
     *               s3Link:
     *                 type: string
     *                 example: "10987465849.jpg"
     *               id:
     *                 type: string
     *                 example: "65151951516"
     *               primary:
     *                 type: boolean
     *                 example: true
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/family:
     *   patch:
     *     summary: API for updating family details of a user
     *     tags: [Family details APIs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               familyStatus:
     *                 type: string
     *                 example: "rich"
     *               familyValues:
     *                 type: string
     *                 example: "Con"
     *               familyType:
     *                 type: string
     *                 example: "joint"
     *               familyIncome:
     *                 type: number
     *                 example: "1"
     *               fatherOccupation:
     *                 type: string
     *                 example: "Ser"
     *               motherOccupation:
     *                 type: string
     *                 example: "Hous"
     *               brothers:
     *                 type: string
     *                 example: "2"
     *               marriedBrothers:
     *                 type: string
     *                 example: "1"
     *               sisters:
     *                 type: string
     *                 example: "2"
     *               marriedSisters:
     *                 type: string
     *                 example: "1"
     *               gothra:
     *                 type: string
     *                 example: "Gautama"
     *               familyBasedOutOf:
     *                 type: string
     *                 example: "Ind"
     *               livingWithParents:
     *                 type: string
     *                 example: "Y"
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
         * @swagger
         * /api/family:
         *   get:
         *     summary: API for retrieving family details
         *     tags: [Family details APIs]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       '200':
         *         description: Successful response
         *         content:
         *           application/json: {}
         *       '400':
         *         description: Bad request
         *         content:
         *           application/json: {}
         *       '401':
         *         description: Unauthorised
         *         content:
         *           application/json: {}
    */
    /**
         * @swagger
         * /api/preference:
         *   get:
         *     summary: API for retrieving partner preferences
         *     tags: [Partner preference APIs]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       '200':
         *         description: Successful response
         *         content:
         *           application/json: {}
         *       '400':
         *         description: Bad request
         *         content:
         *           application/json: {}
         *       '401':
         *         description: Unauthorised
         *         content:
         *           application/json: {}
    */
    /**
     * @swagger
     * /api/preference:
     *   patch:
     *     summary: API for updating partner preferences of a user
     *     tags: [Partner preference APIs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               country:
     *                 type: array
     *                 items:
     *                   type: string
     *                   example: "Ind_101"
     *               residentialStatus:
     *                 type: array
     *                 items:
     *                   type: string
     *                   example: "Citi1"
     *               occupation:
     *                 type: array
     *                 items:
     *                   type: string
     *                   example: "Acco0"
     *               maritalStatus:
     *                 type: array
     *                 items:
     *                   type: string
     *                   example: "nvm"
     *               religion:
     *                 type: array
     *                 items:
     *                   type: string
     *                   example: "hin"
     *               cast:
     *                 type: array
     *                 items:
     *                   type: string
     *                   example: "Hind01"
     *               education:
     *                 type: array
     *                 items:
     *                   type: string
     *                   example: "Btech"
     *               horoscope:
     *                 type: array
     *                 items:
     *                   type: string
     *                   example: "TA"
     *               motherTongue:
     *                 type: array
     *                 items:
     *                   type: string
     *                   example: "Engl3"
     *               manglik:
     *                 type: array
     *                 items:
     *                   type: string
     *                   example: "non"
     *               age:
     *                   type: object
     *                   properties:
     *                       min:
     *                           type: number
     *                           example: 20
     *                       max:
     *                         type: number
     *                         example: 30
     *               height:
     *                   type: object
     *                   properties:
     *                       min:
     *                           type: number
     *                           example: 20
     *                       max:
     *                         type: number
     *                         example: 30
     *               income:
     *                   type: object
     *                   properties:
     *                       min:
     *                           type: number
     *                           example: 20
     *                       max:
     *                         type: number
     *                         example: 30
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
         * @swagger
         * /api/lookup?type={type}:
         *   get:
         *     summary: API for retrieving lookup data
         *     tags: [Lookup APIs]
         *     parameters:
         *       - in: path
         *         name: type
         *         required: false
         *         schema:
         *           type: string
         *           description: Lookup type you are expecting the data in
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       '200':
         *         description: Successful response
         *         content:
         *           application/json: {}
         *       '400':
         *         description: Bad request
         *         content:
         *           application/json: {}
         *       '401':
         *         description: Unauthorised
         *         content:
         *           application/json: {}
    */
    /**
         * @swagger
         * /api/lookup/getCountryLookup?type={type}:
         *   get:
         *     summary: API for retrieving country lookup data
         *     tags: [Lookup APIs]
         *     parameters:
         *       - in: path
         *         name: type
         *         required: false
         *         schema:
         *           type: string
         *           description: Lookup type you are expecting the data in
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       '200':
         *         description: Successful response
         *         content:
         *           application/json: {}
         *       '400':
         *         description: Bad request
         *         content:
         *           application/json: {}
         *       '401':
         *         description: Unauthorised
         *         content:
         *           application/json: {}
    */
    /**
         * @swagger
         * /api/lookup/getStateLookup/{country_id}?type={type}:
         *   get:
         *     summary: API for retrieving state lookup data
         *     tags: [Lookup APIs]
         *     parameters:
         *       - in: path
         *         name: type
         *         required: false
         *         schema:
         *           type: string
         *           description: Lookup type you are expecting the data in
         *       - in: path
         *         name: country_id
         *         required: true
         *         schema:
         *           type: string
         *           description: The name of the country for which you need the states
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       '200':
         *         description: Successful response
         *         content:
         *           application/json: {}
         *       '400':
         *         description: Bad request
         *         content:
         *           application/json: {}
         *       '401':
         *         description: Unauthorised
         *         content:
         *           application/json: {}
    */
     /**
           * @swagger
           * /api/lookup/getCityLookup/{state_id}?type={type}:
           *   get:
           *     summary: API for retrieving city lookup data
           *     tags: [Lookup APIs]
           *     parameters:
           *       - in: path
           *         name: state_id
           *         required: true
           *         schema:
           *           type: string
           *           description: The name of the state for which you need the cities
           *       - in: path
           *         name: type
           *         required: false
           *         schema:
           *           type: string
           *           description: Lookup type you are expecting the data in 
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/interest/getInterests:
           *   get:
           *     summary: API for getting interests received from other profiles
           *     tags: [Dashboard APIs]
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/getMyProfileView:
           *   get:
           *     summary: API for viewing my profile details
           *     tags: [Dashboard APIs]
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/getMyDeclinedProfiles:
           *   get:
           *     summary: API for getting profiles that I have declined
           *     tags: [Dashboard APIs]
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/getUsersWhoHaveDeclinedMe:
           *   get:
           *     summary: API for getting users who have declined my interest.
           *     tags: [Dashboard APIs]
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/getMyInterestedProfiles:
           *   get:
           *     summary: API for getting users to whom I have sent interest.
           *     tags: [Dashboard APIs]
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
    /**
     * @swagger
     * /api/interest/sendInterest:
     *   post:
     *     summary: API for sending interest to a user.
     *     tags: [Dashboard APIs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               targetId:
     *                 type: string
     *                 example: "64e1eda453a6d21b4fdf44ab"
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/interest/unsendInterest:
     *   post:
     *     summary: API for un-sending interest to a user.
     *     tags: [Dashboard APIs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               receiver_id:
     *                 type: string
     *                 example: "Client ID of the user to whom you have sent the interest"
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/interest/updateInterest:
     *   post:
     *     summary: API for un-sending interest to a user.
     *     tags: [Dashboard APIs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               _id:
     *                 type: string
     *                 example: "Interest_ID_received_from_get_interest"
     *               status:
     *                 type: string
     *                 example: "reject"
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/dashboard/searchProfile:
     *   post:
     *     summary: API for searching a user.
     *     tags: [Dashboard APIs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               country:
     *                 type: array
     *                 items:
     *                   type: string
     *                   example: "Ind_101"
     *               religion:
     *                 type: array
     *                 items:
     *                   type: string
     *                   example: "hin"
     *               motherTongue:
     *                 type: array
     *                 items:
     *                   type: string
     *                   example: "Arab0"
     *               maritalStatus:
     *                 type: array
     *                 items:
     *                   type: string
     *                   example: "nvm"
     *               age:
     *                   type: object
     *                   properties:
     *                       min:
     *                           type: number
     *                           example: 20
     *                       max:
     *                         type: number
     *                         example: 30
     *               income:
     *                   type: object
     *                   properties:
     *                       min:
     *                           type: number
     *                           example: 0
     *                       max:
     *                         type: number
     *                         example: 14
     *               height:
     *                   type: object
     *                   properties:
     *                       min:
     *                           type: number
     *                           example: 20
     *                       max:
     *                         type: number
     *                         example: 30
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
     /**
           * @swagger
           * /api/dashboard/getAcceptanceProfiles/{type}:
           *   get:
           *     summary: API for getting profiles who has accepted me(Acceptances)
           *     tags: [Dashboard APIs]
           *     security:
           *       - bearerAuth: []
           *     parameters:
           *       - in: path
           *         name: type
           *         required: true
           *         schema:
           *           type: string
           *           description: Id of the user who you want to view
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/getSliderPics/{name}:
           *   get:
           *     summary: API for getting slider pics for dashboard
           *     tags: [Dashboard APIs]
           *     parameters:
           *       - in: path
           *         name: name
           *         required: true
           *         schema:
           *           type: string
           *           description: Index of the file
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/getJustJoined:
           *   get:
           *     summary: API for getting profiles who just joined(Just joined)
           *     tags: [Dashboard APIs]
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/getAllProfiles:
           *   get:
           *     summary: API for getting all the profiles.
           *     tags: [Dashboard APIs]
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/visitProfile/{user_id}:
           *   get:
           *     summary: API for bisiting a profile
           *     tags: [Dashboard APIs]
           *     parameters:
           *       - in: path
           *         name: user_id
           *         required: true
           *         schema:
           *           type: string
           *           description: Id of the user who you want to view
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/getProfileVisitors:
           *   get:
           *     summary: API for getting profile visitors
           *     tags: [Dashboard APIs]
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/shortlist/{user_id}:
           *   get:
           *     summary: API for shortlisting a profile
           *     tags: [Dashboard APIs]
           *     parameters:
           *       - in: path
           *         name: user_id
           *         required: true
           *         schema:
           *           type: string
           *           description: Id of the user who user wants to shortlist
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/unshortlist/{user_id}:
           *   get:
           *     summary: API for un-shortlisting a profile
           *     tags: [Dashboard APIs]
           *     parameters:
           *       - in: path
           *         name: user_id
           *         required: true
           *         schema:
           *           type: string
           *           description: Id of the user who user wants to unshortlist
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/getMyShortlistedProfiles:
           *   get:
           *     summary: API for getting profiles that I have shortlisted
           *     tags: [Dashboard APIs]
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/ignoreProfile/{user_id}:
           *   get:
           *     summary: API for ignoring a profile
           *     tags: [Dashboard APIs]
           *     parameters:
           *       - in: path
           *         name: user_id
           *         required: true
           *         schema:
           *           type: string
           *           description: Id of the user who current user wants to ignore.
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/getAllIgnoredProfiles:
           *   get:
           *     summary: API for getting profiles that I have ignored.
           *     tags: [Dashboard APIs]
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/interest/getDailyRecommendations:
           *   get:
           *     summary: API for getting daily recommendations..
           *     tags: [Dashboard APIs]
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/auth/searchByProfileID/{heartsId}:
           *   get:
           *     summary: API for searching a profile by hearts ID.
           *     tags: [Dashboard APIs]
           *     parameters:
           *       - in: path
           *         name: heartsId
           *         required: true
           *         schema:
           *           type: string
           *           description: Hearts ID for searching the user.
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/blockProfile/{id}:
           *   get:
           *     summary: API for blocking a user.
           *     tags: [Dashboard APIs]
           *     parameters:
           *       - in: path
           *         name: id
           *         required: true
           *         schema:
           *           type: string
           *           description: ID of the user who is being blocked by the current user.
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/getMyBlockedProfiles:
           *   get:
           *     summary: API for getting profiles I have blocked
           *     tags: [Dashboard APIs]
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/unblockProfile/{id}:
           *   get:
           *     summary: API for un-blocking a user.
           *     tags: [Dashboard APIs]
           *     parameters:
           *       - in: path
           *         name: id
           *         required: true
           *         schema:
           *           type: string
           *           description: ID of the user who user wants to unblock..
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/unIgnoreProfile/{id}:
           *   get:
           *     summary: API for un-ignoring a user.
           *     tags: [Dashboard APIs]
           *     parameters:
           *       - in: path
           *         name: id
           *         required: true
           *         schema:
           *           type: string
           *           description: ID of the user who user wants to un ignore.
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
      * @swagger
      * /api/dashboard/submitReview:
      *   post:
      *     summary: API for submitting reviews
      *     tags: [Dashboard APIs]
      *     requestBody:
      *       required: true
      *       content:
      *         application/json:
      *           schema:
      *             type: object
      *             properties:
      *               rating:
      *                 type: number
      *                 example: 3
      *               comments:
      *                 type: string
      *                 example: "Good app"
      *     security:
      *       - bearerAuth: []
      *     responses:
      *       '200':
      *         description: Successful response
      *         content:
      *           application/json: {}
      *       '400':
      *         description: Bad request
      *         content:
      *           application/json: {}
      *       '401':
      *         description: Unauthorized
      *         content:
      *           application/json: {}
      */
    /**
           * @swagger
           * /api/dashboard/getMyMembershipDetails:
           *   get:
           *     summary: API for getting my membership details.
           *     tags: [Dashboard APIs]
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
    /**
     * @swagger
     * /api/dashboard/updateNotificationCount:
     *   post:
     *     summary: API for updating notification count.
     *     tags: [Dashboard APIs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               ids:
     *                 type: array
     *                 items:
     *                   type: string
     *                   example: "64f0460553a6d21b4fe662b4"
     *               type:
     *                 type: string
     *                 example: "interestReceived"
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
     /** 
           * @swagger
           * /api/dashboard/getMembershipList:
           *   get:
           *     summary: API for getting membership plans.
           *     tags: [Payment APIs]
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/getMyUnlockedProfiles:
           *   get:
           *     summary: API for getting my unlocked profiles..
           *     tags: [Payment APIs]
           *     security:
           *       - bearerAuth: []
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/buyMembership/{membership_id}:
           *   get:
           *     summary: API for generating a token for payment
           *     tags: [Payment APIs]
           *     security:
           *       - bearerAuth: []
           *     parameters:
           *       - in: path
           *         name: membership_id
           *         required: true
           *         schema:
           *           type: string
           *           description: ID of the plan to buy a membership.
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/unlockProfile/{target_id}:
           *   get:
           *     summary: API for unlocking a profile
           *     tags: [Payment APIs]
           *     security:
           *       - bearerAuth: []
           *     parameters:
           *       - in: path
           *         name: target_id
           *         required: true
           *         schema:
           *           type: string
           *           description: ID of the plan to buy a membership.
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
     /**
           * @swagger
           * /api/dashboard/verifyPayment/{order_id}:
           *   get:
           *     summary: API for verifying a token for payment
           *     tags: [Payment APIs]
           *     security:
           *       - bearerAuth: []
           *     parameters:
           *       - in: path
           *         name: order_id
           *         required: true
           *         schema:
           *           type: string
           *           description: Order ID of the payment user has done.
           *     responses:
           *       '200':
           *         description: Successful response
           *         content:
           *           application/json: {}
           *       '400':
           *         description: Bad request
           *         content:
           *           application/json: {}
           *       '401':
           *         description: Unauthorised
           *         content:
           *           application/json: {}
      */
   /**
     * @swagger
     * /api/auth/deleteUser/{phone}:
     *   delete:
     *     summary: API for deleting a particular user by phone number.
     *     tags: [Misc APIs]
     *     parameters:
     *       - in: path
     *         name: phone
     *         required: true
     *         schema:
     *           type: string
     *           description: Phone number
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
    */
   /**
     * @swagger
     * /api/chAdmin/getAllUsers/{type}:
     *   get:
     *     summary: API for getting users for admin.
     *     tags: [Admin APIs]
     *     parameters:
     *       - in: path
     *         name: type
     *         required: true
     *         schema:
     *           type: string
     *           description: Type can be unverified or all
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
    */
   /**
     * @swagger
     * /api/chAdmin/verifyUser/{id}:
     *   get:
     *     summary: API for veriying the user.
     *     tags: [Admin APIs]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           description: ID of the unverified user
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
    */
   /**
     * @swagger
     * /api/chAdmin/triggerNotifications/:
     *   post:
     *     summary: API for sending notification to unpaid members.
     *     tags: [Admin APIs]
     *     requestBody:
     *       required: true
     *       content:
     *         application/x-www-form-urlencoded:
     *           schema:
     *             type: object
     *             required: [title, description]
     *             properties:
     *               title:
     *                 type: string
     *               description:
     *                 type: string
     *         application/json:
     *           schema:
     *             type: object
     *             required: [title, description]
     *             properties:
     *               title:
     *                 type: string
     *                 example: "Double Benefits Special Offer."
     *               description:
     *                 type: string
     *                 example: "We are thrilled to offer you Double Benefits on our Subscription packs. Double the validity and double the number of contacts on all membership packs till 6th August. Subscribe now!!! For Assistance call: +91 9452613159. Best Regards, Team Connecting Hearts."
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
    */
    /**
     * @swagger
     * /api/chAdmin/grantMembership:
     *   post:
     *     summary: API for granting a membership to a user
     *     tags: [Admin APIs]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               membership_id:
     *                 type: string
     *                 example: "64dcb4aa53a6d21b4fdd424b"
     *               user_id:
     *                 type: string
     *                 example: "64dcb4aa53a6d21b4fdd424b"
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/chAdmin/testEmail:
     *   post:
     *     summary: API for testing email sending functionality
     *     tags: [Admin APIs]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               email:
     *                 type: string
     *                 example: "test@example.com"
     *               text:
     *                 type: string
     *                 example: "This is a test email message"
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */
    /**
     * @swagger
     * /api/dashboard/updateName:
     *   post: 
     *     summary: API for updating the name of the user
     *     tags: [Dashboard APIs]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 example: "John Doe"
     *               number:
     *                 type: string
     *                 example: "9876543210"
     *     responses:
     *       '200':
     *         description: Successful response
     *         content:
     *           application/json: {}
     *       '400':
     *         description: Bad request
     *         content:
     *           application/json: {}   
     *       '401':
     *         description: Unauthorised
     *         content:
     *           application/json: {}
     */   
};
