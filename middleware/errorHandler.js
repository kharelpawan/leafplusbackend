const constants = require('../constants').constants;  
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  console.log(statusCode);
  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      res.json({
        title: "Bad Request",
        message: err.message,
        stack: err.stack,
      });
      break;
    case constants.UNAUTHORIZED_ERROR:
      res.json({
        title: "Unauthorized",
        message: err.message,
        stack: err.stack,
      });
      break;
    case constants.FORBIDDEN_ERROR:
      res.json({
        title: "Forbidden",
        message: err.message,
        stack: err.stack,
      });
      break;
    case constants.NOT_FOUND_ERROR:
      res.json({
        title: "Not Found",
        message: err.message,
        stack: err.stack,
      });
      break;
    case constants.SERVER_ERROR:
      res.json({
        title: "Server Error",
        message: err.message,
        stack: err.stack,
      });
      break;
    default:
      console.log("No error, all good!");
      break;
  } 
};

module.exports = errorHandler;  