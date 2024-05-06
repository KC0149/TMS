const express = require("express");
const app = express();
const dotenv = require("dotenv");
const errorMiddleware = require("./middlewares/error");
const ErrorHandler = require("./utils/errorHandler");
const cookieParser = require("cookie-parser");
dotenv.config({ path: "./config/config.env" });
const cors = require("cors");

//handling uncaught exception (must be on top)
process.on("uncaughtException", err => {
  console.log(`Error: ${err.message}`);
  console.log("shutting down the server due to uncaught Exception");
  process.exit(1);
});
//setupbody parser - to read data from body
app.use(express.json());

//setup cookie parser - to read cookies
app.use(cookieParser());

//Set up cors to be accessible by other domains (white-listing)
app.use(cors({ origin: [process.env.FRONTEND], credentials: true }));

//import routes
const auth = require("./routes/auth");
//routes
app.use(auth);

//handling unhandled routes(not found routes)
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

//Middleware to handle errors
app.use(errorMiddleware);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log(`Server started on port ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});

//handling unhandled promise rejection
process.on("unhandledRejection", err => {
  console.log(`Error: ${err.message}`);
  console.log("shutting down the server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
