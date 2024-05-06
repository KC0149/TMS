const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    errMessage: err.message,
    stack: err.stack
  });
};
