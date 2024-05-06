// get the client
const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

// create the connection to database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PW,
  database: process.env.DB_NAME,
  port: 3306
});

module.exports = db;
