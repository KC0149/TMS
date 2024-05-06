const catchAsyncError = require("../middlewares/catchAsyncError")

const db = require("../config/database")
const ErrorHandler = require("../utils/errorHandler")
const { compareSync } = require("bcryptjs")

//-----create app
exports.createApp = catchAsyncError(async (req, res, next) => {
  const {
    App_Acronym,
    App_Description,
    App_Rnumber,
    App_startDate,
    App_endDate,
    App_permit_Open,
    App_permit_toDoList,
    App_permit_Doing,
    App_permit_Done,
    App_permit_Create
  } = req.body

  if (!App_Acronym || !App_Rnumber) {
    return next(new ErrorHandler("Please enter App_Acronym & App_Rnumber", 400))
  } else {
    db.query(`SELECT App_Acronym FROM application WHERE App_Acronym  = ?`, [App_Acronym], async (err, results) => {
      if (err) throw err
      if (results[0]) {
        return res.status(401).json({
          success: false,
          message: "App_Acronym has already been registered"
        })
      } else {
        //add check app_acronym unique?
        const App_permit_OpenString = App_permit_Open.join(",")
        const App_permit_toDoListString = App_permit_toDoList.join(",")
        const App_permit_DoingString = App_permit_Doing.join(",")
        const App_permit_DoneString = App_permit_Done.join(",")

        //create app
        let sql = `INSERT INTO application(App_Acronym,App_Description, App_Rnumber, App_startDate, App_endDate,App_permit_Open,App_permit_toDoList,App_permit_Doing,App_permit_Done,Start_Rnumber,App_permit_create)  VALUES(?,?,?,?,?,?,?,?,?,?,?)`
        db.query(
          sql,
          [
            App_Acronym,
            App_Description,
            App_Rnumber,
            App_startDate,
            App_endDate,
            App_permit_OpenString,
            App_permit_toDoListString,
            App_permit_DoingString,
            App_permit_DoneString,
            App_Rnumber,
            App_permit_Create
          ],
          async (error, results) => {
            if (error) {
              console.log(error)
              // Handle error response
              return res.status(500).json({
                success: false,
                message: "Database error"
              })
            }
            console.log("app created")
            res.status(200).json({
              success: true,
              message: "App successfully created"
            })
          }
        )
      }
    })
  }
})

//--create task
exports.createTask = catchAsyncError(async (req, res, next) => {
  const Task_creator = req.user.userId
  const Task_owner = req.user.userId
  const { Task_name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_createDate } = req.body
  console.log(Task_notes)
  if (!Task_name) {
    return next(new ErrorHandler("please enter Task_name"), 400)
  } else {
    //check taskname is unique
    db.query(`SELECT Task_name FROM task WHERE Task_name=? and Task_app_Acronym  = ?`, [Task_name, Task_app_Acronym], async (err, results) => {
      if (err) throw err
      if (results[0]) {
        console.log(results[0])
        return res.status(401).json({
          success: false,
          message: "Task_name has already been registered"
        })
      } else {
        let sql = `SELECT App_Rnumber FROM application WHERE App_Acronym = ? `
        db.query(sql, [Task_app_Acronym], async (error, results) => {
          if (error) throw error
          else {
            appR = results[0].App_Rnumber
            const Task_id = Task_app_Acronym + "_" + appR
            if (!Task_notes) {
              const newTask_notes = `User:${Task_creator},state:${Task_state},DateTime:${Task_createDate} \nTask has been created\n`
              let sql2 = `INSERT INTO task(Task_name, Task_description,Task_id, Task_notes,Task_plan,Task_app_Acronym,Task_state,Task_creator,Task_owner,Task_createDate)  VALUES(?,?,?,?,?,?,?,?,?,?)`
              db.query(
                sql2,
                [
                  Task_name,
                  Task_description,
                  Task_id,
                  newTask_notes,
                  Task_plan,
                  Task_app_Acronym,
                  Task_state,
                  Task_creator,
                  Task_owner,
                  Task_createDate
                ],
                async (error, results) => {
                  if (error) {
                    console.log(error)
                    // Handle error response
                    return res.status(500).json({
                      success: false,
                      message: "Database error"
                    })
                  } else {
                    let sql3 = `UPDATE task
                  SET Task_color = (SELECT Color FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym=?)
                  WHERE Task_id = ?`
                    db.query(sql3, [Task_plan, Task_app_Acronym, Task_id], async (error, results) => {
                      if (error) {
                        console.log(error)
                        // Handle error response
                        return res.status(500).json({
                          success: false,
                          message: "Database error"
                        })
                      }
                    })

                    let sql = `UPDATE application SET App_Rnumber = App_Rnumber+1  WHERE App_Acronym = ?  `
                    db.query(sql, [Task_app_Acronym], async (error, results) => {
                      if (error) throw error
                      else {
                        console.log("task created")
                        res.status(200).json({
                          success: true,
                          message: "task successfully created"
                        })
                      }
                    })
                  }
                }
              )
            } else {
              const newTask_notes =
                `User:${Task_creator},state:${Task_state},DateTime:${Task_createDate} \nTask has been created\n` + `Notes: ` + Task_notes + `\n\n`

              let sql2 = `INSERT INTO task(Task_name, Task_description,Task_id, Task_notes,Task_plan,Task_app_Acronym,Task_state,Task_creator,Task_owner,Task_createDate)  VALUES(?,?,?,?,?,?,?,?,?,?)`
              db.query(
                sql2,
                [
                  Task_name,
                  Task_description,
                  Task_id,
                  newTask_notes,
                  Task_plan,
                  Task_app_Acronym,
                  Task_state,
                  Task_creator,
                  Task_owner,
                  Task_createDate
                ],
                async (error, results) => {
                  if (error) {
                    console.log(error)
                    // Handle error response
                    return res.status(500).json({
                      success: false,
                      message: "Database error"
                    })
                  } else {
                    let sql3 = `UPDATE task
                  SET Task_color = (SELECT Color FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym=?)
                  WHERE Task_id = ?`
                    db.query(sql3, [Task_plan, Task_app_Acronym, Task_id], async (error, results) => {
                      if (error) {
                        console.log(error)
                        // Handle error response
                        return res.status(500).json({
                          success: false,
                          message: "Database error"
                        })
                      }
                    })

                    let sql = `UPDATE application SET App_Rnumber = App_Rnumber+1  WHERE App_Acronym = ?  `
                    db.query(sql, [Task_app_Acronym], async (error, results) => {
                      if (error) throw error
                      else {
                        console.log("task created")
                        res.status(200).json({
                          success: true,
                          message: "task successfully created"
                        })
                      }
                    })
                  }
                }
              )
            }
          }
        })
      }
    })
  }
})

//get apps
exports.viewApps = catchAsyncError(async (req, res, next) => {
  db.query(`SELECT * FROM application ORDER BY created_at DESC`, async (err, results) => {
    if (err) throw err
    else {
      res.status(200).json({
        success: true,
        data: results
      })
    }
  })
})

//view task
exports.viewTasks = catchAsyncError(async (req, res, next) => {
  const { App_Acronym } = req.body

  db.query(`SELECT * FROM task WHERE Task_app_Acronym = ? `, [App_Acronym], async (err, results) => {
    if (err) throw err
    else {
      res.status(200).json({
        success: true,
        data: results
      })
    }
  })
})
//get task

exports.getTask = catchAsyncError(async (req, res, next) => {
  const { Task_id } = req.body

  db.query(`SELECT * FROM task WHERE \`Task_id\` = ? `, [Task_id], async (err, results) => {
    if (err) throw err
    else {
      res.status(200).json({
        success: true,
        data: results
      })
    }
  })
})

//update app
//
exports.updateApp = catchAsyncError(async (req, res, next) => {
  const {
    App_Acronym,
    App_Description,
    App_startDate,
    App_endDate,
    App_permit_Open,
    App_permit_toDoList,
    App_permit_Doing,
    App_permit_Done,
    App_permit_Create
  } = req.body
  try {
    if (App_Description) {
      db.query(`UPDATE application SET App_Description = ? WHERE App_Acronym = ?`, [App_Description, App_Acronym], async (err, results) => {
        if (err) {
          console.log(err)
          // Handle error response
          return res.status(500).json({
            success: false,
            message: "Database error"
          })
        }
      })
    }

    if (App_startDate) {
      db.query(`UPDATE application SET App_startDate = ? WHERE App_Acronym = ?`, [App_startDate, App_Acronym], async (err, results) => {
        if (err) {
          console.log(err)
          // Handle error response
          return res.status(500).json({
            success: false,
            message: "Database error"
          })
        }
      })
    }

    if (App_endDate) {
      db.query(`UPDATE application SET App_endDate = ? WHERE App_Acronym = ?`, [App_endDate, App_Acronym], async (err, results) => {
        if (err) {
          console.log(err)
          // Handle error response
          return res.status(500).json({
            success: false,
            message: "Database error"
          })
        }
      })
    }

    if (App_permit_Open) {
      const App_permit_OpenString = App_permit_Open.toString()
      db.query(`UPDATE application SET App_permit_Open = ? WHERE App_Acronym = ?`, [App_permit_OpenString, App_Acronym], async (err, results) => {
        if (err) {
          console.log(err)
          // Handle error response
          return res.status(500).json({
            success: false,
            message: "Database error"
          })
        }
      })
    }

    if (App_permit_toDoList) {
      const App_permit_toDoListString = App_permit_toDoList.toString()
      db.query(
        `UPDATE application SET App_permit_toDoList = ? WHERE App_Acronym = ?`,
        [App_permit_toDoListString, App_Acronym],
        async (err, results) => {
          if (err) {
            console.log(err)
            // Handle error response
            return res.status(500).json({
              success: false,
              message: "Database error"
            })
          }
        }
      )
    }

    if (App_permit_Doing) {
      const App_permit_DoingString = App_permit_Doing.toString()
      db.query(`UPDATE application SET App_permit_Doing = ? WHERE App_Acronym = ?`, [App_permit_DoingString, App_Acronym], async (err, results) => {
        if (err) {
          console.log(err)
          // Handle error response
          return res.status(500).json({
            success: false,
            message: "Database error"
          })
        }
      })
    }

    if (App_permit_Done) {
      const App_permit_DoneString = App_permit_Done.toString()
      db.query(`UPDATE application SET App_permit_Done = ? WHERE App_Acronym = ?`, [App_permit_DoneString, App_Acronym], async (err, results) => {
        if (err) {
          console.log(err)
          // Handle error response
          return res.status(500).json({
            success: false,
            message: "Database error"
          })
        }
      })
    }
    if (App_permit_Create) {
      const App_permit_CreateString = App_permit_Create.toString()
      db.query(`UPDATE application SET App_permit_create = ? WHERE App_Acronym = ?`, [App_permit_CreateString, App_Acronym], async (err, results) => {
        if (err) {
          console.log(err)
          // Handle error response
          return res.status(500).json({
            success: false,
            message: "Database error"
          })
        }
      })
    }

    console.log("app Updated")
    res.status(200).json({
      success: true,
      message: "App successfully updated"
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Database error"
    })
  }
})
