const jwt = require('jsonwebtoken');

const generateToken = (userId,role) => {
  const payload = { userId,role };
  const secretKey = process.env.SECRET_KEY; 
  const options = { expiresIn: '1000h' };
  const token = jwt.sign(payload, secretKey, options);
  return token;
};

const removeBearerFromToken = (token) => {
  // Check if the token starts with "Bearer "
  if (token && token.startsWith('Bearer ')) {
    return token.replace('Bearer ', '');
  }
  // //console.log({token})
  return token;
};

const protectedRoute = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({
      code: "CH401",
      status: "Error",
      err: "Authentication token not found. Please login again.",
    });
  }
  //console.log(req.originalUrl);
  
  token = removeBearerFromToken(token);
  console.log({token})
  // if(token==process.env.SECURITY_TOKEN && ( req.originalUrl=="/api/interest/truncateDB")){
  //   return next();
  // }
  try {
    const secretKey = process.env.SECRET_KEY; // Replace with your own secret key
    const decoded = jwt.verify(token, secretKey);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log('JWT Verification Error:', error.name, error.message);
    let errorMessage = "Authentication error. Please login again.";
    
    // Provide specific error messages based on JWT error type
    if (error.name === 'TokenExpiredError') {
      errorMessage = "Session expired. Please login again.";
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = "Invalid session token. Please login again.";
    } else if (error.name === 'NotBeforeError') {
      errorMessage = "Session not active yet. Please try again.";
    }
    
    return res.status(401).json({
      code: "CH401",
      status: "Error",
      err: errorMessage,
    });
  }
};
const customRoute = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({
      code: "CH401",
      status: "Error",
      err: "Authentication token not found. Please login again.",
    });
  }
  //console.log(req.originalUrl);
  token = removeBearerFromToken(token);
  if(token==process.env.SECURITY_TOKEN && ( req.originalUrl=="/api/lookup/getCountryCodeLookup")){
    return next();
  }
  else{
    return res.status(401).json({
      code: "CH401",
      status: "Error",
      err: "Invalid authentication token. Please login again.",
    });
  }
};
const adminProtectedRoute = async (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({
      code: "CH401",
      status: "Error",
      err: "Authentication token not found. Please login again.",
    });
  }
  token = removeBearerFromToken(token);
  try {
    const secretKey = process.env.SECRET_KEY; // Replace with your own secret key
    const decoded = jwt.verify(token, secretKey);
    req.userId = decoded.userId;
    // if (req.userId == "64dcb4aa53a6d21b4fdd424b")
    if (decoded.role=="admin")
      next();
    else {
      return res.status(403).json({
        code: "CH404",
        status: "Error",
        err: "You are not allowed to perform this action. Please contact admin.",
      });
    }
  } catch (error) {
    console.log(error)
    return res.status(401).json({
      code: "CH401",
      status: "Error",
      err: "Admin session expired. Please login again.",
    });
  }
};
module.exports = { generateToken, protectedRoute,adminProtectedRoute,customRoute };
