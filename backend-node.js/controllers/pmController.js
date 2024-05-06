const catchAsyncError = require("../middlewares/catchAsyncError");

const db = require("../config/database");
const ErrorHandler = require("../utils/errorHandler");

//-----create Plan
exports.createPlan = catchAsyncError(async (req, res, next) => {
  const { Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym, Color } = req.body;
  console.log(Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym);

  if (!Plan_MVP_name) {
    return next(new ErrorHandler("please enter Plan_MVP_name"), 400);
  } else {
    //check plan  is unique
    db.query(`SELECT Plan_MVP_name FROM plan WHERE Plan_MVP_name=? and Plan_app_Acronym  = ?`, [Plan_MVP_name, Plan_app_Acronym], async (err, results) => {
      if (err) throw err;
      if (results[0]) {
        return res.status(401).json({
          success: false,
          message: "Plan_MVP_name has already been registered"
        });
      } else {
        let sql2 = `INSERT INTO plan(Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym,Color)  VALUES(?,?,?,?,?)`;
        db.query(sql2, [Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym, Color], async (error, results) => {
          if (error) {
            console.log(error);
            // Handle error response
            return res.status(500).json({
              success: false,
              message: "Database error"
            });
          }

          console.log("New plan created");
          res.status(200).json({
            success: true,
            message: "Plan successfully created"
          });
        });
      }
      //create plans
    });
  }
});

// get plans for specific app

exports.viewPlans = catchAsyncError(async (req, res, next) => {
  const { Plan_app_Acronym } = req.body;

  db.query(`SELECT * FROM plan WHERE Plan_app_Acronym = ? `, [Plan_app_Acronym], async (err, results) => {
    if (err) throw err;
    else {
      res.status(200).json({
        success: true,
        data: results
      });
    }
  });
});

//-----update Plan
exports.updatePlan = catchAsyncError(async (req, res, next) => {
  const { Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym, Color } = req.body;
  console.log(Plan_MVP_name, Plan_startDate, Plan_endDate, Plan_app_Acronym);
  try {
    if (Plan_startDate) {
      let sql1 = `UPDATE plan SET Plan_startDate = ? WHERE Plan_MVP_name = ? and  Plan_app_Acronym=?`;
      db.query(sql1, [Plan_startDate, Plan_MVP_name, Plan_app_Acronym], async (error, results) => {
        if (error) {
          console.log(error);
        }
      });
    }

    if (Plan_endDate) {
      let sql2 = `UPDATE plan SET Plan_endDate = ? WHERE Plan_MVP_name = ? and  Plan_app_Acronym=?`;
      db.query(sql2, [Plan_endDate, Plan_MVP_name, Plan_app_Acronym], async (error, results) => {
        if (error) {
          console.log(error);
        }
      });
    }
    if (Color) {
      let sql2 = `UPDATE plan SET Color = ? WHERE Plan_MVP_name = ? and  Plan_app_Acronym=?`;
      db.query(sql2, [Color, Plan_MVP_name, Plan_app_Acronym], async (error, results) => {
        if (error) {
          console.log(error);
        }
      });
      let sql3 = `UPDATE task
    SET Task_color = (SELECT Color FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym=?)
    WHERE Task_app_Acronym = ? AND Task_plan=?`;
      db.query(sql3, [Plan_MVP_name, Plan_app_Acronym, Plan_app_Acronym, Plan_MVP_name], async (error, results) => {
        if (error) {
          console.log(error);
          // Handle error response
          return res.status(500).json({
            success: false,
            message: "Database error"
          });
        }
      });
    }
    console.log("Plan updated");
    return res.status(200).json({
      success: true,
      message: "Plan successfully Updated"
    });
  } catch (erorr) {
    return res.status(500).json({
      success: false,
      message: "Database error"
    });
  }
});
