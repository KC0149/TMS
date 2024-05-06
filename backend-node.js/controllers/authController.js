const catchAsyncError = require("../middlewares/catchAsyncError")

const db = require("../config/database")
const ErrorHandler = require("../utils/errorHandler")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const sendToken = require("../utils/jwsToken")

//register a new user => /register
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { userId, password, email, group, isActive } = req.body
  //check userid passsword not empty
  if (!userId || !password) {
    return next(new ErrorHandler("Please enter App_Acronym & App_Rnumber", 400))
  } else {
    //check username is unique
    db.query(`SELECT userId FROM accounts WHERE userId  = ?`, [userId], async (err, results) => {
      if (err) throw err
      if (results[0]) {
        return res.status(401).json({
          success: false,
          message: "UserId has already been registered"
        })
      } else {
        //need to bcrypt password
        //hash password
        const hpassword = await bcrypt.hash(password, 10)
        const groupString = group.join(",")

        //if there is email
        if (email) {
          //check email is unique
          db.query(`SELECT email FROM accounts WHERE email = ?`, [email], async (err, results) => {
            if (err) throw err
            if (results[0]) {
              return res.status(402).json({
                success: false,
                message: "Email has already been registered"
              })
            } else {
              //if email is unique
              let sql = `INSERT INTO accounts(userId,password, email, \`group\`, isActive)  VALUES(?,?,?,?,?)`
              db.query(sql, [userId, hpassword, email, groupString, isActive], async (error, results) => {
                if (error) {
                  console.log(error)
                  // Handle error response
                  return res.status(500).json({
                    success: false,
                    message: "Database error"
                  })
                }
                return res.status(200).json({
                  success: true,
                  message: "User Created"
                })
              })
            }
          })
        } else {
          //if no email
          //create account
          let sql = `INSERT INTO accounts(userId,password, email, \`group\`, isActive)  VALUES(?,?,?,?,?)`
          db.query(sql, [userId, hpassword, email, groupString, isActive], async (error, results) => {
            if (error) {
              console.log(error)
              // Handle error response
              return res.status(500).json({
                success: false,
                message: "Database error"
              })
            }
            return res.status(200).json({
              success: true,
              message: "User Created"
            })
          })
        }
      }
    })
  }
})

//log in user  => /login
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { userId, password } = req.body
  //check if userid or password is empty
  if (!userId || !password) {
    return next(new ErrorHandler("Please enter userId & password", 400))
  }
  //finding user in database
  else {
    let sql = `SELECT userId,password,isActive FROM accounts WHERE userId = ?`
    db.query(sql, [userId], async (err, results) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: "database error"
        })
      }
      if (!results[0]) {
        return next(new ErrorHandler("Invalid userId or Password", 401))
      } else if (results[0].isActive === "not active") {
        return res.status(405).json({
          success: false,
          message: "user not active"
        })
      } else if (!results[0] || !(await bcrypt.compare(password, results[0].password))) {
        return next(new ErrorHandler(("Invalid userId or Password", 401)))
      } else {
        // const token = jwt.sign({ id: results[0].userId }, process.env.JWT_SECRET, {
        //   expiresIn: process.env.JWT_EXPIRES_TIME
        // });
        //create token
        sendToken(results[0].userId, 200, res, "login Successful")
      }
    })
  }
})

//logout user => /logout

exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie("token", "none", {
    expire: new Date(Date.now),
    httpOnly: true
  })
  res.status(200).json({
    success: true,
    message: "logged out successfully"
  })
})

//update user => /update

exports.updateUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body

  // Get the user's information from the middleware
  const user = req.user

  if (!email && !password) {
    return next(new ErrorHandler("Please enter email or password to update", 400))
  }
  if (email) {
    //check email is unique
    db.query(`SELECT email FROM accounts WHERE email = ?`, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "database error"
        })
      }
      if (results[0]) {
        return res.status(402).json({
          success: false,
          message: "Email has already been registered"
        })
      } else {
        db.query(`UPDATE accounts SET email = ? WHERE userId = ?`, [email, user.userId], async (err, results) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "database error"
            })
          } else {
            return res.status(200).json({
              success: true,
              message: "Profile updated successfully"
            })
          }
        })
      }
    })
  } else if (password) {
    //hash password
    const hpassword = await bcrypt.hash(password, 10)
    db.query(`UPDATE accounts SET password = ? WHERE userId = ?`, [hpassword, user.userId], async (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "database error"
        })
      } else {
        return res.status(200).json({
          success: true,
          message: "Profile updated successfully"
        })
      }
    })
  } else if (email && password) {
    //check email is unique
    db.query(`SELECT email FROM accounts WHERE email = ?`, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "database error"
        })
      }
      if (results[0]) {
        return res.status(402).json({
          success: false,
          message: "Email has already been registered"
        })
      } else {
        db.query(`UPDATE accounts SET email = ? WHERE userId = ?`, [email, user.userId], async (err, results) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: "database error"
            })
          } else {
            //hash password
            const hpassword = await bcrypt.hash(password, 10)
            db.query(`UPDATE accounts SET password = ? WHERE userId = ?`, [hpassword, user.userId], async (err, results) => {
              if (err) {
                return res.status(500).json({
                  success: false,
                  message: "database error"
                })
              } else {
                return res.status(200).json({
                  success: true,
                  message: "Profile updated successfully"
                })
              }
            })
          }
        })
      }
    })
  }
})

// check if username exsits

exports.doesUseridExist = catchAsyncError(async (req, res, next) => {
  const { userId } = req.body
  //check username is unique
  db.query(`SELECT userId FROM accounts WHERE userId  = ?`, [userId], async (err, results) => {
    if (err) {
      //cannot find userid in db hence unique
      return err
    }
    if (results[0]) {
      res.json(true)
    } else {
      res.json(false)
    }
  })
})

exports.doesEmailExist = catchAsyncError(async (req, res, next) => {
  const { email } = req.body
  //check email is unique
  db.query(`SELECT email FROM accounts WHERE email = ?`, [email], async (err, results) => {
    if (err) {
      //cannot find userid in db hence unique
      return err
    }
    if (results[0]) {
      res.json(true)
    } else {
      res.json(false)
    }
  })
})
