const jwt = require("jsonwebtoken");

const catchAsyncError = require("./catchAsyncError");
const ErrorHandler = require("../utils/errorHandler");
const db = require("../config/database");

//check if user is authenticated
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  let token;
  //get from cookies (user this for frontend)
  const accessToken = req.cookies["token"];

  // get from bearer token in postman only
  // add pm.environment.set('token',pm.response.json().token) to tests in postman
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]; // 'Bear<space>token'
  }
  if (!accessToken) {
    return next(new ErrorHandler("login first to access this resource", 401));
  }
  try {
    //use token to find id
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    // find id in db with id found by token
    db.query(`SELECT * FROM accounts where userId = ?`, [decoded.id], (err, result) => {
      if (err) return next();
      else {
        req.user = result[0];

        return next();
      }
    });
  } catch (err) {
    return next(new ErrorHandler("login first to access this resource", 401));
  }
});

//handling users group
exports.authorizeRoles = (...group) => {
  return (req, res, next) => {
    const userRoles = req.user.group.split(",");
    const allowed = userRoles.some(role => group.includes(role));

    if (!allowed) {
      return next(new ErrorHandler(`You are not allowed to access this resource`, 408));
    }

    next();
  };
};

//------------check group if user is authenticated----------
exports.checkGroup = (...Group) =>
  catchAsyncError(async (req, res, next) => {
    const userId = req.user.userId;
    const groupname = Group;

    CheckGroup(userId, groupname)
      .then(allowed => {
        if (!allowed) {
          res.status(408).json({
            success: false,
            message: "User is not allowed"
          });
        } else {
          res.status(200).json({
            success: true,
            message: "User is allowed"
          });
        }
      })
      .catch(error => {
        // Handle errors here
        res.status(500).json({
          success: false,
          message: "An error occurred",
          error: error.message
        });
      });
  });

function CheckGroup(userId, groupname) {
  return new Promise((resolve, reject) => {
    try {
      db.query(`SELECT \`group\` FROM accounts where userId = ?`, [userId], (err, result) => {
        if (err) {
          reject(err);
        } else {
          const userRoles = result[0].group.split(","); //split them into array
          const allowed = userRoles.some(role => groupname.includes(role));
          resolve(allowed);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

// //------------check group if user is authenticated----------
// exports.checkGroup =
//   catchAsyncError(async (req, res, next) => {
//    const{userId,groupname}=req.body
//     try {
//       db.query(`SELECT \`group\` FROM accounts where userId = ?`, [userId], (err, result) => {
//         if (err) {
//           return next(new ErrorHandler(("Database error", 401)));
//         } else {
//           const userRoles = result[0].group.split(","); //split them into array
//           const allowed = userRoles.some(role => groupname.includes(role));
//           if (!allowed) {
//             res.status(408).json({
//               success: false,
//               message: "User is not allowed"
//             });
//           } else {
//             res.status(200).json({
//               success: true,
//               message: "User is allowed"
//             });
//           }
//         }
//       });
//     } catch (err) {
//       return next(new ErrorHandler("login first to access this resource", 401));
//     }

//   });

//------------check group if user is permited for the current state (returns status)----------
// exports.checkAppPermit = catchAsyncError(async (req, res, next) => {
//   const userId = req.user.userId;
//   const { App_Acronym, Task_state } = req.body;
//   const { permitState } = checkPermitState(Task_state); //get current permit for the current state

//   try {
//     db.query(`SELECT \`group\` FROM accounts where userId = ?`, [userId], (err, result) => {
//       if (err) {
//         return next(new ErrorHandler(("Database error", 401)));
//       } else {
//         const userRoles = result[0].group.split(","); //split them into array

//         db.query(`SELECT ${permitState} FROM Application where App_Acronym = ?`, [App_Acronym], (err, result) => {
//           if (err) {
//             console.log(err);
//           }

//           const groupname = result[0][permitState].split(","); //split them into array

//           const allowed = userRoles.some(role => groupname.includes(role));

//           if (!allowed) {
//             res.status(408).json({
//               success: false,
//               message: "User is not allowed"
//             });
//           } else {
//             res.status(200).json({
//               success: true,
//               message: "User is allowed"
//             });
//           }
//         });
//       }
//     });
//   } catch (err) {
//     return next(new ErrorHandler("login first to access this resource", 401));
//   }
// });

exports.checkAppPermit = catchAsyncError(async (req, res, next) => {
  const userId = req.user.userId;
  const { App_Acronym, Task_state } = req.body;
  const { permitState } = checkPermitState(Task_state); //get current permit for the current state

  db.query(`SELECT ${permitState} FROM Application where App_Acronym = ?`, [App_Acronym], (err, result) => {
    if (err) {
      return next(new ErrorHandler(("Database error", 401)));
    } else {
      const groupname = result[0][permitState].split(","); //split them into array

      CheckGroup(userId, groupname)
        .then(allowed => {
          if (!allowed) {
            res.status(408).json({
              success: false,
              message: "User is not allowed"
            });
          } else {
            res.status(200).json({
              success: true,
              message: "User is allowed"
            });
          }
        })
        .catch(error => {
          // Handle errors here
          res.status(500).json({
            success: false,
            message: "An error occurred",
            error: error.message
          });
        });
    }
  });
});

// //check permit middleware
// exports.checkAppPermitMiddle = catchAsyncError(async (req, res, next) => {
//   const userId = req.user.userId;
//   const { App_Acronym, Task_state } = req.body;
//   const { permitState } = checkPermitState(Task_state); //get permit group from the current state

//   try {
//     db.query(`SELECT \`group\` FROM accounts where userId = ?`, [userId], (err, result) => {
//       if (err) {
//         return next(new ErrorHandler(("Database error", 401)));
//       } else {
//         const userRoles = result[0].group.split(","); //split them into array

//         db.query(`SELECT ${permitState} FROM Application where App_Acronym = ?`, [App_Acronym], (err, result) => {
//           if (err) {
//             console.log(err);
//           }

//           const groupname = result[0][permitState].split(","); //split them into array

//           const allowed = userRoles.some(role => groupname.includes(role));
//           if (!allowed) {
//             res.status(408).json({
//               success: false,
//               message: "User is not allowed"
//             });
//           } else {
//             next();
//           }
//         });
//       }
//     });
//   } catch (err) {
//     return next(new ErrorHandler("login first to access this resource", 401));
//   }
// });
//check permit middleware
exports.checkAppPermitMiddle = catchAsyncError(async (req, res, next) => {
  const userId = req.user.userId;
  const { App_Acronym, Task_state } = req.body;
  const { permitState } = checkPermitState(Task_state); //get permit group from the current state
  db.query(`SELECT ${permitState} FROM Application where App_Acronym = ?`, [App_Acronym], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      const groupname = result[0][permitState].split(","); //split them into array

      CheckGroup(userId, groupname)
        .then(allowed => {
          if (!allowed) {
            res.status(408).json({
              success: false,
              message: "User is not allowed"
            });
          } else {
            next();
          }
        })
        .catch(error => {
          // Handle errors here
          res.status(500).json({
            success: false,
            message: "An error occurred",
            error: error.message
          });
        });
    }
  });
});

function checkPermitState(Task_state) {
  let permitState = "";

  switch (Task_state) {
    case "open":
      permitState = "App_permit_Open";
      break;
    case "todo":
      permitState = "App_permit_toDoList";
      break;
    case "doing":
      permitState = "App_permit_Doing";
      break;
    case "done":
      permitState = "App_permit_Done";
      break;
    case "create":
      permitState = "App_permit_create";
      break;
  }

  return { permitState };
}

//------------check group if user is in app permit create ----------
exports.checkAppPermitCreate = catchAsyncError(async (req, res, next) => {
  const userId = req.user.userId;
  const { Task_app_Acronym } = req.body;
  const App_permit_Create = "App_permit_create";

  try {
    db.query(`SELECT \`group\` FROM accounts where userId = ?`, [userId], (err, result) => {
      if (err) {
        return next(new ErrorHandler(("Database error", 401)));
      } else {
        const userRoles = result[0].group.split(","); //split them into array
        db.query(`SELECT App_permit_create FROM Application where App_Acronym = ?`, [Task_app_Acronym], (err, result) => {
          if (err) {
            console.log(err);
          }

          const groupname = result[0][App_permit_Create].split(","); //split them into array

          const allowed = userRoles.some(role => groupname.includes(role));
          if (!allowed) {
            res.status(408).json({
              success: false,
              message: "User is not allowed"
            });
          } else {
            next();
          }
        });
      }
    });
  } catch (err) {
    return next(new ErrorHandler("login first to access this resource", 401));
  }
});
