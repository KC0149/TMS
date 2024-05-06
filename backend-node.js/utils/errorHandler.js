class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message); //constructor or error class
    this.statusCode = statusCode; //status code that user pass

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorHandler; //can use it any where
