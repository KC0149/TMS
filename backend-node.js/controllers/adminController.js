const catchAsyncError = require("../middlewares/catchAsyncError")

const db = require("../config/database")
const ErrorHandler = require("../utils/errorHandler")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const sendToken = require("../utils/jwsToken")
//update user as a admin => /:id/update

exports.updateAllUser = catchAsyncError(async (req, res, next) => {
  const { userId, password, email, group, isActive } = req.body
  if (!userId) {
    return next((new ErrorHandler("Please choose a user update"), 400))
  }
  if (!email && !password && !group && !isActive) {
    return next(new ErrorHandler("Please select a value to update", 400))
  }

  if (group) {
    // Convert the group array to a comma-separated string
    const groupString = group.toString()
    db.query(`UPDATE accounts SET \`group\` = ? WHERE userId = ?`, [groupString, userId], async (err, results) => {
      if (err) console.log(err)
    })
  }
  if (isActive) {
    db.query(`UPDATE accounts SET isActive = ? WHERE userId = ?`, [isActive, userId], async (err, results) => {
      if (err) throw err
    })
  }
  if (password) {
    //hash password
    const hpassword = await bcrypt.hash(password, 10)
    db.query(`UPDATE accounts SET password = ? WHERE userId = ?`, [hpassword, userId], async (err, results) => {
      if (err) throw err
    })
  }

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
        db.query(`UPDATE accounts SET email = ? WHERE userId = ?`, [email, userId], async (err, results) => {
          if (err) throw err
          else {
            return res.status(200).json({
              success: true,
              message: "User's Profile updated successfully"
            })
          }
        })
      }
    })
  } else {
    res.status(200).json({
      success: true,
      message: "User's Profile updated successfully"
    })
  }
})

////View all user  => /view-users
exports.viewAlluser = catchAsyncError(async (req, res, next) => {
  db.query(`SELECT * FROM accounts ORDER BY created_at DESC`, async (err, results) => {
    if (err) throw err
    else {
      res.status(200).json({
        success: true,
        data: results
      })
    }
  })
})

exports.checkToken = function (req, res) {
  try {
    const accessToken = req.cookies["token"]

    req.user = jwt.verify(accessToken, process.env.JWT_SECRET)

    res.json(true) // return true if token is verified
  } catch (e) {
    throw e
  }
}

exports.checkActive = function (req, res) {
  const user = req.user // Assuming you have the user object in the request
  user.isActive.includes("active")

  if (user.isActive === "active") {
    res.status(200).json({
      success: true,
      message: "User is Active"
    })
  } else {
    res.status(405).json({
      success: false,
      message: "User is not Active"
    })
  }
}

//view all groups
exports.viewGroups = catchAsyncError(async (req, res, next) => {
  db.query(`SELECT * FROM \`groups\``, async (err, results) => {
    if (err) throw err
    else {
      res.status(200).json({
        success: true,
        data: results
      })
    }
  })
})

//create new group
exports.createGroup = catchAsyncError(async (req, res, next) => {
  const { group } = req.body

  if (!group) {
    return res.status(400).json({ error: "Invalid group value" })
  }
  db.query(`INSERT INTO \`groups\` SET \`group\` = ? `, [group], async (err, results) => {
    if (err) throw err
    else {
      res.status(200).json({
        success: true,
        data: results
      })
    }
  })
})
