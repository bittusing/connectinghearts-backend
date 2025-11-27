# Connecting Hearts Backend - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Features & Modules](#features--modules)
6. [API Documentation](#api-documentation)
7. [Authentication & Authorization](#authentication--authorization)
8. [Database Schemas](#database-schemas)
9. [Helper Functions](#helper-functions)
10. [Error Handling](#error-handling)
11. [Deployment](#deployment)

---

## Project Overview

**Connecting Hearts** is a matrimonial/dating platform backend built with Node.js and Express. The application provides a comprehensive API for user registration, profile management, partner matching, interest management, membership subscriptions, and administrative functions.

### Key Features
- User authentication with OTP verification
- Profile management (personal, family, partner preferences)
- Interest sending and management
- Profile browsing and search
- Membership and payment management
- Admin dashboard and controls
- Push notifications via Firebase
- File uploads to AWS S3
- Daily profile recommendations

---

## Architecture & Technology Stack

### Backend Framework
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - Database (via Mongoose ODM)

### Core Dependencies
- **jsonwebtoken** - JWT authentication
- **argon2** - Password hashing
- **multer** - File upload handling
- **aws-sdk** - AWS S3 integration
- **firebase-admin** - Push notifications
- **twilio** - SMS service (OTP)
- **@sendgrid/mail** - Email service
- **swagger-jsdoc** & **swagger-ui-express** - API documentation

### Development Tools
- **nodemon** - Development server auto-reload
- **env-cmd** - Environment variable management
- **dotenv** - Environment configuration

---

## Project Structure

```
backend/
├── api/                          # API modules
│   ├── adminController/         # Admin operations
│   ├── commonApis/              # Common lookup APIs
│   ├── dashboardController/     # Dashboard & profile browsing
│   ├── familyDetails/           # Family information management
│   ├── logicController/         # Interest & recommendation logic
│   ├── partnerPreference/       # Partner preference settings
│   ├── personalDetails/         # Personal information management
│   ├── profileDetails/          # Profile photo & details
│   ├── srcmDetails/             # SRCM ID document management
│   └── users/                   # User authentication & management
├── config/                      # Configuration files
│   └── db.js                   # MongoDB connection
├── helper_functions/            # Utility functions
│   ├── dateHelper.js
│   ├── getUsers.js
│   ├── jsonConverter.js
│   ├── logger.js
│   ├── mongoUtils.js
│   ├── notification.js
│   ├── otpGenerator.js
│   ├── s3Helper.js
│   ├── sendEmail.js
│   ├── sendSMS.js
│   └── validateBody.js
├── middlewares/                 # Express middlewares
│   └── auth.js                 # Authentication middleware
├── schemas/                     # MongoDB schemas
│   ├── user.schema.js
│   ├── personalDetails.schema.js
│   ├── familyDetails.schema.js
│   ├── partnerPreference.schema.js
│   ├── interest.schema.js
│   └── ... (other schemas)
├── scripts/                     # Utility scripts
├── staticHoldings/              # Static files (Firebase keys)
├── logs/                        # Application logs
├── app.js                       # Main application file
├── router.js                    # Route configuration
├── swag-doc.js                  # Swagger documentation
└── package.json                 # Dependencies

```

---

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB instance
- AWS S3 account (for file storage)
- Firebase Admin SDK credentials
- Twilio account (for SMS)
- SendGrid account (for emails)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Application
APP_PORT=3856
IS_PROD=FALSE
SECRET_KEY=your_jwt_secret_key
SECURITY_TOKEN=your_security_token

# MongoDB
MONGO_USERNAME=your_mongo_username
MONGO_PASSWORD=your_mongo_password
MONGO_URL=your_mongo_host
MONGO_PORT=27017
MONGO_DB_NAME=connectinghearts

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# SendGrid (Email)
SENDGRID_API_KEY=your_sendgrid_key

# Password Regex
PASSWORD_REGEX=^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

3. Start production server:
```bash
npm run prod
```

### API Documentation

Swagger documentation is available at:
- Local: `http://localhost:3856/swagger-apis`
- Production: `https://backend.prod.connectingheart.co/swagger-apis`

---

## Features & Modules

### 1. Authentication Module (`/api/auth`)

**Purpose**: User registration, login, OTP verification, password management

**Key Features**:
- Phone number-based OTP authentication
- User signup with email and password
- Login with phone number and password
- Password change and forgot password flow
- Token validation
- User profile deletion
- Profile ID (Hearts ID) search

**Flow**:
1. **Generate OTP**: User requests OTP via phone number
2. **Verify OTP**: User verifies OTP, receives temporary token
3. **Signup/Login**: User completes registration or logs in
4. **Get JWT Token**: After successful authentication, user receives JWT token
5. **Access Protected Routes**: Use token in `Authorization: Bearer <token>` header

### 2. Personal Details Module (`/api/personalDetails`)

**Purpose**: Manage user's personal information

**Key Features**:
- Update personal details (gender, DOB, height, location, education, etc.)
- Edit specific profile sections
- Retrieve personal details
- Get complete user profile data

**Data Managed**:
- Basic info (gender, name, date of birth)
- Physical attributes (height, body type)
- Location (country, state, city)
- Education and career details
- Religious and cultural information (religion, caste, mother tongue)
- Astrological details (horoscope, manglik, rashi, nakshatra)
- Health information (disability, thalassemia, HIV status)
- Marital status and children information

### 3. Family Details Module (`/api/family`)

**Purpose**: Manage user's family information

**Key Features**:
- Update family details
- Retrieve family information

**Data Managed**:
- Family status and values
- Family type (joint/nuclear)
- Family income
- Parent occupations
- Siblings information (brothers, sisters, married status)
- Gothra
- Family location
- Living arrangements

### 4. Partner Preference Module (`/api/preference`)

**Purpose**: Set and manage partner search preferences

**Key Features**:
- Update partner preferences
- Retrieve current preferences

**Preference Criteria**:
- Location (country, residential status)
- Age range (min/max)
- Height range (min/max)
- Income range (min/max)
- Education level
- Occupation
- Religion and caste
- Marital status
- Horoscope and manglik
- Mother tongue

### 5. Profile Details Module (`/api/profile`)

**Purpose**: Manage profile photos and profile information

**Key Features**:
- Upload profile pictures (multiple)
- Download profile pictures
- Delete profile pictures
- Update profile details
- Set primary profile picture

**Technical Details**:
- Uses Multer for file uploads
- Files stored in AWS S3
- Supports image files only

### 6. SRCM Details Module (`/api/srcmDetails`)

**Purpose**: Manage SRCM (Social Registration Certificate) ID documents

**Key Features**:
- Upload SRCM ID document
- Download SRCM ID document
- Update SRCM details
- Retrieve SRCM information

**Note**: SRCM is likely a verification document required for profile verification.

### 7. Dashboard Module (`/api/dashboard`)

**Purpose**: Main user dashboard operations - browsing, searching, interacting with profiles

**Key Features**:

#### Profile Browsing
- **Get Daily Recommendations**: Personalized profile recommendations
- **Get Just Joined**: Newly registered profiles
- **Get All Profiles**: Browse all available profiles
- **Search Profiles**: Advanced search with filters
- **Get Detail View**: Detailed profile view

#### Profile Interactions
- **Visit Profile**: Track profile visits
- **Send Interest**: Express interest in a profile
- **Shortlist Profile**: Add to shortlist
- **Ignore Profile**: Hide profile from recommendations
- **Block Profile**: Block unwanted profiles
- **Unlock Profile**: Unlock premium profiles (requires coins)

#### Interest Management
- **Get Acceptance Profiles**: Profiles who accepted/received interest
- **Get My Interested Profiles**: Profiles user has shown interest in
- **Get Declined Profiles**: Profiles that declined interest

#### Profile Lists
- **Get My Shortlisted Profiles**: View shortlisted profiles
- **Get All Ignored Profiles**: View ignored profiles
- **Get My Blocked Profiles**: View blocked profiles
- **Get My Unlocked Profiles**: View unlocked profiles
- **Get Profile Visitors**: See who visited your profile

#### Membership & Payments
- **Buy Membership**: Purchase membership plans
- **Get Membership List**: Available membership plans
- **Get My Membership Details**: Current membership status
- **Verify Payment**: Verify payment transactions

#### Other Features
- **Get My Profile View**: View own profile as others see it
- **Get Slider Pics**: Get images for app sliders
- **Submit Review**: Submit app reviews
- **Update Notification Count**: Track notification counts

### 8. Interest/Logic Module (`/api/interest`)

**Purpose**: Manage interest sending, receiving, and recommendations

**Key Features**:
- **Send Interest**: Express interest in a profile
- **Unsend Interest**: Withdraw sent interest
- **Get Interests**: View received interests
- **Update Interest**: Accept/decline interest
- **Get Daily Recommendations**: Algorithm-based profile recommendations

**Interest Statuses**:
- `new`: New interest received
- `accept`: Interest accepted
- `decline`: Interest declined

**Recommendation Algorithm**:
- Matches based on partner preferences
- Filters by gender (opposite gender)
- Considers age, location, education, etc.
- Excludes already interacted profiles

### 9. Lookup/Common APIs Module (`/api/lookup`)

**Purpose**: Provide lookup data for dropdowns and filters

**Key Features**:
- **Get Lookup**: Master lookup data (education, occupation, religion, etc.)
- **Get Country Lookup**: List of countries
- **Get State Lookup**: States by country
- **Get City Lookup**: Cities by state
- **Get Income Lookup**: Income ranges
- **Get Country Code Lookup**: Phone country codes

**Response Formats**:
- Standard array format
- Hashmap format (when `?type=hashmap`)

### 10. Admin Module (`/api/chAdmin`)

**Purpose**: Administrative operations (admin access only)

**Key Features**:
- **Get All Users**: Retrieve all users with filters (verified/unverified)
- **Verify User**: Verify user profiles
- **Grant Membership**: Assign membership to users
- **Send Bulk Notifications**: Send notifications to multiple users
- **Test Email**: Test email functionality

**Access Control**: Requires admin role in JWT token

---

## API Documentation

### Base URL
- **Development**: `http://localhost:3856`
- **Production**: `https://backend.prod.connectingheart.co`

### Common Response Format

#### Success Response
```json
{
  "code": "CH200",
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

#### Error Response
```json
{
  "code": "CH400",
  "status": "failed",
  "err": "Error message"
}
```

### Authentication Endpoints

#### 1. Generate OTP
- **Endpoint**: `POST /api/auth/generateOtp`
- **Auth**: Not required
- **Request Body**:
```json
{
  "phoneNumber": "9999942496",
  "extension": "+91"
}
```
- **Response**: OTP sent to phone number

#### 2. Verify OTP
- **Endpoint**: `POST /api/auth/verifyOTP`
- **Auth**: Not required
- **Request Body**:
```json
{
  "phoneNumber": "9999942496",
  "otp": 119562
}
```
- **Response**: Temporary token for signup

#### 3. Signup
- **Endpoint**: `POST /api/auth/signup`
- **Auth**: Required (temporary token from OTP)
- **Request Body**:
```json
{
  "email": "johndoe@test.com",
  "password": "test@123",
  "confirm_password": "test@123",
  "name": "John Doe",
  "fcmToken": "fcm_token_here"
}
```
- **Response**: JWT token and user data

#### 4. Login
- **Endpoint**: `POST /api/auth/login`
- **Auth**: Not required
- **Request Body**:
```json
{
  "phoneNumber": "9999942496",
  "password": "Hello@123",
  "fcmToken": "fcm_token_here"
}
```
- **Response**: JWT token and user data

#### 5. Get User
- **Endpoint**: `GET /api/auth/getUser`
- **Auth**: Required
- **Response**: User information

#### 6. Change Password
- **Endpoint**: `PATCH /api/auth/changePassword`
- **Auth**: Required
- **Request Body**:
```json
{
  "current_password": "Hello@123",
  "new_password": "Admin@123"
}
```

#### 7. Forgot Password
- **Endpoint**: `GET /api/auth/forgetPassword/:phoneNumber`
- **Auth**: Not required
- **Response**: OTP sent for password reset

#### 8. Verify Forgotten OTP
- **Endpoint**: `POST /api/auth/verifyForgottenOTP`
- **Auth**: Not required
- **Request Body**:
```json
{
  "phoneNumber": "9999942496",
  "otp": "111111"
}
```
- **Response**: Temporary token

#### 9. Update Forgotten Password
- **Endpoint**: `POST /api/auth/updateForgottenPassword`
- **Auth**: Required (temporary token)
- **Request Body**:
```json
{
  "password": "Hello@123"
}
```

#### 10. Search by Profile ID
- **Endpoint**: `GET /api/auth/searchByProfileID/:heartsId`
- **Auth**: Required
- **Response**: User profile with matching Hearts ID

#### 11. Validate Token
- **Endpoint**: `GET /api/auth/validateToken`
- **Auth**: Required
- **Response**: Token validation status

#### 12. Delete Profile
- **Endpoint**: `DELETE /api/auth/deleteProfile`
- **Auth**: Required
- **Request Body**:
```json
{
  "reasonForDeletion": 1,
  "deletionComment": "Personal reasons"
}
```

### Personal Details Endpoints

#### 1. Update Personal Details
- **Endpoint**: `PATCH /api/personalDetails`
- **Auth**: Required
- **Request Body**: Partial personal details object
- **Fields**: gender, dob, height, country, city, religion, cast, education, occupation, etc.

#### 2. Edit Profile
- **Endpoint**: `PATCH /api/personalDetails/editProfile`
- **Auth**: Required
- **Request Body**:
```json
{
  "section": "basic",
  "cast": "updated_cast",
  "height": 72,
  "state": "updated_state"
}
```

#### 3. Get Personal Details
- **Endpoint**: `GET /api/personalDetails`
- **Auth**: Required
- **Response**: User's personal details

#### 4. Get User Profile Data
- **Endpoint**: `GET /api/personalDetails/getUserProfileData`
- **Auth**: Required
- **Response**: Complete profile data organized by sections

### Profile Details Endpoints

#### 1. Update Profile Details
- **Endpoint**: `PATCH /api/profile`
- **Auth**: Required
- **Request Body**: Profile update data

#### 2. Upload Profile Picture
- **Endpoint**: `POST /api/profile/uploadProfilePic`
- **Auth**: Required
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with `profilePhoto` file

#### 3. Download Profile Picture
- **Endpoint**: `GET /api/profile/file/:userId/:fileId`
- **Auth**: Not required (public)
- **Response**: Image file

#### 4. Delete Profile Picture
- **Endpoint**: `DELETE /api/profile/deleteProfilePic/:id`
- **Auth**: Required

### Family Details Endpoints

#### 1. Update Family Details
- **Endpoint**: `PATCH /api/family`
- **Auth**: Required
- **Request Body**: Family details object

#### 2. Get Family Details
- **Endpoint**: `GET /api/family`
- **Auth**: Required
- **Response**: User's family details

### Partner Preference Endpoints

#### 1. Update Partner Preferences
- **Endpoint**: `PATCH /api/preference`
- **Auth**: Required
- **Request Body**: Preference object with arrays and ranges

#### 2. Get Partner Preferences
- **Endpoint**: `GET /api/preference`
- **Auth**: Required
- **Response**: User's partner preferences

### SRCM Details Endpoints

#### 1. Upload SRCM ID
- **Endpoint**: `POST /api/srcmDetails/uploadSrcmId`
- **Auth**: Required
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with `srcmPhoto` file

#### 2. Get SRCM Details
- **Endpoint**: `GET /api/srcmDetails`
- **Auth**: Required
- **Response**: SRCM details

#### 3. Download SRCM ID
- **Endpoint**: `GET /api/srcmDetails/file/:fileName`
- **Auth**: Not required (public)
- **Response**: Document file

#### 4. Update SRCM Details
- **Endpoint**: `PATCH /api/srcmDetails/updateSrcmDetails`
- **Auth**: Required

### Dashboard Endpoints

#### Profile Browsing

1. **Get Daily Recommendations**
   - **Endpoint**: `GET /api/dashboard/getDailyRecommendations`
   - **Auth**: Required
   - **Response**: Recommended profiles based on preferences

2. **Get Just Joined**
   - **Endpoint**: `GET /api/dashboard/getjustJoined`
   - **Auth**: Required
   - **Response**: Recently joined profiles

3. **Get All Profiles**
   - **Endpoint**: `GET /api/dashboard/getAllProfiles`
   - **Auth**: Required
   - **Response**: All available profiles

4. **Search Profiles**
   - **Endpoint**: `POST /api/dashboard/searchProfile`
   - **Auth**: Required
   - **Request Body**: Search filters
   - **Response**: Filtered profiles

5. **Get Detail View**
   - **Endpoint**: `GET /api/dashboard/getDetailView/:target_id`
   - **Auth**: Required
   - **Response**: Complete profile details

#### Profile Interactions

1. **Visit Profile**
   - **Endpoint**: `GET /api/dashboard/visitProfile/:id`
   - **Auth**: Required
   - **Action**: Records profile visit

2. **Shortlist Profile**
   - **Endpoint**: `GET /api/dashboard/shortlist/:id`
   - **Auth**: Required
   - **Action**: Adds profile to shortlist

3. **Unshortlist Profile**
   - **Endpoint**: `GET /api/dashboard/unshortlist/:id`
   - **Auth**: Required
   - **Action**: Removes from shortlist

4. **Ignore Profile**
   - **Endpoint**: `GET /api/dashboard/ignoreProfile/:id`
   - **Auth**: Required
   - **Action**: Hides profile from recommendations

5. **Unignore Profile**
   - **Endpoint**: `GET /api/dashboard/unIgnoreProfile/:id`
   - **Auth**: Required

6. **Block Profile**
   - **Endpoint**: `GET /api/dashboard/blockProfile/:id`
   - **Auth**: Required

7. **Unblock Profile**
   - **Endpoint**: `GET /api/dashboard/unblockProfile/:id`
   - **Auth**: Required

8. **Unlock Profile**
   - **Endpoint**: `GET /api/dashboard/unlockProfile/:target_id`
   - **Auth**: Required
   - **Note**: Requires heart coins

#### Interest Management

1. **Get Acceptance Profiles**
   - **Endpoint**: `GET /api/dashboard/getAcceptanceProfiles/:type`
   - **Auth**: Required
   - **Parameters**: `type` = "acceptedMe" or "acceptedByMe"
   - **Response**: Profiles based on interest acceptance

2. **Get My Interested Profiles**
   - **Endpoint**: `GET /api/dashboard/getMyInterestedProfiles`
   - **Auth**: Required
   - **Response**: Profiles user has shown interest in

3. **Get Declined Profiles**
   - **Endpoint**: `GET /api/dashboard/getMyDeclinedProfiles`
   - **Auth**: Required

4. **Get Users Who Have Declined Me**
   - **Endpoint**: `GET /api/dashboard/getUsersWhoHaveDeclinedMe`
   - **Auth**: Required

#### Profile Lists

1. **Get My Shortlisted Profiles**
   - **Endpoint**: `GET /api/dashboard/getMyShortlistedProfiles`
   - **Auth**: Required

2. **Get All Ignored Profiles**
   - **Endpoint**: `GET /api/dashboard/getAllIgnoredProfiles`
   - **Auth**: Required

3. **Get My Blocked Profiles**
   - **Endpoint**: `GET /api/dashboard/getMyBlockedProfiles`
   - **Auth**: Required

4. **Get My Unlocked Profiles**
   - **Endpoint**: `GET /api/dashboard/getMyUnlockedProfiles`
   - **Auth**: Required

5. **Get Profile Visitors**
   - **Endpoint**: `GET /api/dashboard/getProfileVisitors`
   - **Auth**: Required

#### Membership & Payments

1. **Buy Membership**
   - **Endpoint**: `GET /api/dashboard/buyMembership/:id`
   - **Auth**: Required
   - **Parameters**: `id` = membership plan ID
   - **Response**: Payment gateway redirect or payment details

2. **Get Membership List**
   - **Endpoint**: `GET /api/dashboard/getMembershipList`
   - **Auth**: Required
   - **Response**: Available membership plans

3. **Get My Membership Details**
   - **Endpoint**: `GET /api/dashboard/getMyMembershipDetails`
   - **Auth**: Required
   - **Response**: User's current membership

4. **Verify Payment**
   - **Endpoint**: `GET /api/dashboard/verifyPayment/:orderID`
   - **Auth**: Required
   - **Response**: Payment verification status

#### Other Dashboard Endpoints

1. **Get My Profile View**
   - **Endpoint**: `GET /api/dashboard/getMyProfileView`
   - **Auth**: Required
   - **Response**: Own profile as seen by others

2. **Get Slider Pics**
   - **Endpoint**: `GET /api/dashboard/getSliderPics/:name`
   - **Auth**: Not required
   - **Response**: Slider images

3. **Submit Review**
   - **Endpoint**: `POST /api/dashboard/submitReview`
   - **Auth**: Required
   - **Request Body**: Review data

4. **Update Notification Count**
   - **Endpoint**: `POST /api/dashboard/updateNotificationCount`
   - **Auth**: Required

5. **Update Name**
   - **Endpoint**: `POST /api/dashboard/updateName`
   - **Auth**: Required

### Interest/Logic Endpoints

#### 1. Send Interest
- **Endpoint**: `POST /api/interest/sendInterest`
- **Auth**: Required
- **Request Body**:
```json
{
  "targetId": "user_id_here"
}
```
- **Action**: Sends interest to target user, triggers notification

#### 2. Unsend Interest
- **Endpoint**: `POST /api/interest/unsendInterest`
- **Auth**: Required
- **Request Body**:
```json
{
  "targetId": "user_id_here"
}
```

#### 3. Get Interests
- **Endpoint**: `GET /api/interest/getInterests`
- **Auth**: Required
- **Response**: Received interests with profile data

#### 4. Update Interest
- **Endpoint**: `POST /api/interest/updateInterest`
- **Auth**: Required
- **Request Body**:
```json
{
  "targetId": "user_id_here",
  "status": "accept" // or "decline"
}
```

#### 5. Get Daily Recommendations
- **Endpoint**: `GET /api/interest/getDailyRecommendations`
- **Auth**: Required
- **Response**: Algorithm-based profile recommendations

#### 6. Send Notifications
- **Endpoint**: `GET /api/interest/sendNotifications`
- **Auth**: Required (admin)
- **Action**: Triggers bulk notifications

### Lookup/Common APIs Endpoints

#### 1. Get Lookup
- **Endpoint**: `GET /api/lookup?type=hashmap`
- **Auth**: Required
- **Query Parameters**: `type` (optional) - "hashmap" for hashmap format
- **Response**: Master lookup data

#### 2. Get Country Lookup
- **Endpoint**: `GET /api/lookup/getCountryLookup?type=hashmap`
- **Auth**: Required
- **Response**: List of countries

#### 3. Get State Lookup
- **Endpoint**: `GET /api/lookup/getStateLookup/:countryId?type=hashmap`
- **Auth**: Required
- **Response**: States for given country

#### 4. Get City Lookup
- **Endpoint**: `GET /api/lookup/getCityLookup/:stateId?type=hashmap`
- **Auth**: Required
- **Response**: Cities for given state

#### 5. Get Income Lookup
- **Endpoint**: `GET /api/lookup/getIncomeLookup`
- **Auth**: Required
- **Response**: Income range options

### Admin Endpoints

#### 1. Get All Users
- **Endpoint**: `GET /api/chAdmin/getAllUsers/:type`
- **Auth**: Required (Admin)
- **Parameters**: `type` = "verified" or "unverified"
- **Response**: List of users

#### 2. Verify User
- **Endpoint**: `GET /api/chAdmin/verifyUser/:id`
- **Auth**: Required (Admin)
- **Action**: Verifies user profile

#### 3. Grant Membership
- **Endpoint**: `POST /api/chAdmin/grantMembership`
- **Auth**: Required (Admin)
- **Request Body**: Membership grant data

#### 4. Send Bulk Notifications
- **Endpoint**: `POST /api/chAdmin/triggerNotifications`
- **Auth**: Required
- **Request Body**: Notification data

#### 5. Test Email
- **Endpoint**: `POST /api/chAdmin/testEmail`
- **Auth**: Required
- **Request Body**: Email test data

---

## Authentication & Authorization

### Authentication Flow

1. **OTP Generation**: User requests OTP via phone number
2. **OTP Verification**: User verifies OTP, receives temporary token
3. **Signup/Login**: User completes registration or logs in
4. **JWT Token**: After successful authentication, user receives JWT token
5. **Protected Routes**: Include token in request header: `Authorization: Bearer <token>`

### Token Format

JWT tokens contain:
- `userId`: User's MongoDB ObjectId
- `role`: User role (default: "client", admin: "admin")
- Expiration: 1000 hours

### Middleware

#### Protected Route (`protectedRoute`)
- Validates JWT token
- Extracts `userId` from token
- Required for most user operations
- Error codes: `CH401` for authentication errors

#### Admin Protected Route (`adminProtectedRoute`)
- Validates JWT token
- Checks for admin role
- Required for admin operations
- Error codes: `CH401` (auth error), `CH404` (access denied)

#### Custom Route (`customRoute`)
- Special route for specific endpoints
- Uses security token validation

### Token Errors

- **CH401**: Authentication error
  - Token not found
  - Token expired
  - Invalid token
  - Session expired

---

## Database Schemas

### User Schema
- Basic user information
- Authentication data
- Profile pictures
- Lists (visitors, shortlisted, ignored, blocked, unlocked)
- Membership information
- Heart coins balance

### Personal Details Schema
- Personal information
- Physical attributes
- Location details
- Education and career
- Religious and cultural info
- Astrological details
- Health information
- Linked to User via `clientID`

### Family Details Schema
- Family status and values
- Family composition
- Parent information
- Sibling details
- Linked to User via `clientID`

### Partner Preference Schema
- Preference criteria (arrays and ranges)
- Age, height, income ranges
- Location preferences
- Education and occupation preferences
- Linked to User via `clientID`

### Interest Schema
- Interest relationships
- `requester_id`: User who sent interest
- `receiver_id`: User who received interest
- `status`: "new", "accept", "decline"
- Timestamps

### Other Schemas
- **Lifestyle Schema**: Lifestyle preferences
- **SRCM Details Schema**: Verification documents
- **Membership Details Schema**: Membership plans
- **Notification Schema**: Push notifications
- **Review Schema**: User reviews
- **Payment Audit Schema**: Payment transactions
- **OTP Schema**: OTP storage
- **Lookup Schema**: Master lookup data
- **City/State/Country Schemas**: Location data

---

## Helper Functions

### Authentication & Security
- **auth.js**: JWT token generation and validation
- **validateBody.js**: Request body validation
- **otpGenerator.js**: OTP generation logic

### File Management
- **s3Helper.js**: AWS S3 upload/download operations
- Uses Multer for file handling

### Communication
- **sendSMS.js**: Twilio SMS integration
- **sendEmail.js**: SendGrid email integration
- **notification.js**: Firebase push notifications

### Utilities
- **dateHelper.js**: Date manipulation functions
- **getUsers.js**: User data retrieval and formatting
- **jsonConverter.js**: Data format conversion
- **logger.js**: Application logging
- **mongoUtils.js**: MongoDB utility functions

---

## Error Handling

### Error Response Format

```json
{
  "code": "CH400",
  "status": "failed",
  "err": "Error message description"
}
```

### Error Codes

- **CH200**: Success
- **CH400**: Bad Request / Validation Error
- **CH401**: Authentication Error
- **CH404**: Not Found / Access Denied
- **CH500**: Internal Server Error

### Common Error Scenarios

1. **Validation Errors**: Missing or invalid request body fields
2. **Authentication Errors**: Invalid or expired tokens
3. **Not Found Errors**: User or resource not found
4. **Duplicate Entry**: Profile already exists
5. **Permission Errors**: Insufficient permissions

---

## Deployment

### Production Setup

1. **Environment Configuration**
   - Use `.env.prod` for production
   - Set `IS_PROD=TRUE`
   - Configure production MongoDB
   - Set up production AWS S3 bucket

2. **Start Production Server**
   ```bash
   npm run prod
   ```

3. **PM2 Process Manager** (optional)
   - Use `start-prod.js` or `start-prod.sh`
   - Configure in `pm2.txt`

4. **Scripts**
   - **Cleanup Profile Pics**: `npm run cleanup-profile-pics`

### Production URLs

- **API Base**: `https://backend.prod.connectingheart.co`
- **Swagger Docs**: `https://backend.prod.connectingheart.co/swagger-apis`

---

## Best Practices

1. **Security**
   - Always use HTTPS in production
   - Validate all input data
   - Use parameterized queries
   - Implement rate limiting
   - Sanitize user inputs

2. **Error Handling**
   - Provide meaningful error messages
   - Log errors for debugging
   - Don't expose sensitive information

3. **Performance**
   - Use indexes on frequently queried fields
   - Implement pagination for large datasets
   - Cache lookup data when possible
   - Optimize database queries

4. **Code Quality**
   - Follow consistent naming conventions
   - Write modular, reusable code
   - Document complex logic
   - Regular code reviews

---

## Support & Contact

For issues, questions, or contributions:
- Check Swagger documentation: `/swagger-apis`
- Review logs: `logs/app.log`
- Contact: Akshay Seth (Author)

---

**Last Updated**: 2024
**Version**: 1.0.0

