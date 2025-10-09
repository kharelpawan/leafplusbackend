// const constants = require('../constants').constants;  
// const errorHandler = (err, req, res, next) => {
//   const statusCode = res.statusCode ? res.statusCode : 500;
//   res.status(statusCode);
//   console.log(statusCode);
//   switch (statusCode) {
//     case constants.VALIDATION_ERROR:
//       res.json({
//         title: "Bad Request",
//         message: err.message,
//         stack: err.stack,
//       });
//       break;
//     case constants.UNAUTHORIZED_ERROR:
//       res.json({
//         title: "Unauthorized",
//         message: err.message,
//         stack: err.stack,
//       });
//       break;
//     case constants.FORBIDDEN_ERROR:
//       res.json({
//         title: "Forbidden",
//         message: err.message,
//         stack: err.stack,
//       });
//       break;
//     case constants.NOT_FOUND_ERROR:
//       res.json({
//         title: "Not Found",
//         message: err.message,
//         stack: err.stack,
//       });
//       break;
//     case constants.SERVER_ERROR:
//       res.json({
//         title: "Server Error",
//         message: err.message,
//         stack: err.stack,
//       });
//       break;
//     default:
//       console.log("No error, all good!");
//       break;
//   } 
// };

// module.exports = errorHandler;  

const { constants } = require('../constants');

// Centralized Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  console.error(" Error Caught:", err);

  // Default status
  let statusCode = res.statusCode ? res.statusCode : 500;
  let message = err.message || "Internal Server Error";

  // --- Specific Error Handlers ---

  //  MongoDB Duplicate Key Error
  if (err.code === 11000) {
    statusCode = constants.CONFLICT_ERROR;
    message = `Duplicate value for field(s): ${Object.keys(err.keyValue).join(', ')}`;
  }

  //  Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = constants.VALIDATION_ERROR;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  //  CastError (Invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    statusCode = constants.VALIDATION_ERROR;
    message = `Invalid value for field: ${err.path}`;
  }

  //  JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = constants.UNAUTHORIZED_ERROR;
    message = 'Invalid or malformed token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = constants.UNAUTHORIZED_ERROR;
    message = 'Token expired, please login again';
  }

  //  Mongoose Connection Error
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    statusCode = constants.SERVER_ERROR;
    message = 'Database connection error';
  }

  //  Fallback for all other errors
  res.status(statusCode).json({
    success: false,
    title: getErrorTitle(statusCode),
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

// Helper to map status codes to titles
function getErrorTitle(code) {
  switch (code) {
    case 400: return 'Validation Error';
    case 401: return 'Unauthorized';
    case 403: return 'Forbidden';
    case 404: return 'Not Found';
    case 409: return 'Conflict';
    case 500: return 'Server Error';
    default: return 'Error';
  }
}

module.exports = errorHandler;
