const { TokenExpiredError } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const sendToken = (userId, statusCode, res, message) => {
  //create JWT token
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME
  });
  //option for cookie
  const options = {
    expiresIn: new Date(Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000),
    httpOnly: false
  };
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    message: message
  });
};

module.exports = sendToken;
