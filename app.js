require("dotenv").config();
// ⚡ IMPORTANT: Disable console.log in production to save CloudWatch costs
if (process.env.IS_PROD === "TRUE") {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.warn = () => {};
  // Keep console.error for critical issues only
}

const express = require("express");
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const mongooseObject = require('./config/db');
const AWS = require('aws-sdk');
const admin = require('firebase-admin');
// const serviceAccount = require('./staticHoldings/connectingheartsv2-firebase-adminsdk-u7a8o-93f9bfd3ab.json');
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
var bodyParser = require('body-parser');

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize socket handlers
const socketHandler = require('./socket/socketHandler');
socketHandler(io);

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Connecting Hearts API Docs",
            version: "1.0.0",
            description: "APIs for Connecting Hearts",
        },
        servers: process.env.IS_PROD === "TRUE" ? [
            {
                url: "https://backend.prod.connectingheart.co",
                description: "HTTPS Prod environment for API"
            },
            {
                url: "http://localhost:3856",
                description: "Local environment for API"
            }
        ] : [
            {
                url: "http://localhost:3856",
                description: "Local environment for API"
            },
            {
                url: "https://backend.prod.connectingheart.co",
                description: "HTTPS Prod environment for API"
            }
        ],
    },
    apis: ["swag-doc.js"],
};

const swaggerDoc = swaggerJSDoc(options);
app.use('/swagger-apis', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     // Your other configuration options
// });
// app.use(express.json());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH','OPTIONS'],
}));
app.use((req, res, next) => {
    // Only log in development to save CloudWatch costs
    if (process.env.IS_PROD !== "TRUE") {
        console.log(`Incoming Request - ${req.method} ${req.url}`);
        console.log('Request Body:', req.body);
    }
    next();
});
const main_Router = require("./router");
app.use(main_Router);

function errHandler(err, req, res, next) {
    if (err) {
        res.json({
            success: 500,
            message: err.message
        })
    }
}
app.use(errHandler);


app.get('/', function (req, res) {
    res.send("<h1 style='text-align: center; margin-top:20%'> Welcome to the backend environment designed for connecting hearts! </h1>");
});

app.get('/abc', function (req, res) {
    res.send("hello");
});

// 

server.listen(process.env.APP_PORT, () => {
    console.log("server working port : " + process.env.APP_PORT)
});