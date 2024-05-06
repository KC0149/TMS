const catchAsyncError = require("../middlewares/catchAsyncError")
const db = require("../config/database")
const ErrorHandler = require("../utils/errorHandler")
const sendEmail = require("../utils/sendEmail")

//--------update task with new plans or notes(pm only)-----------------------
exports.updateTask = catchAsyncError(async (req, res, next) => {
  const userId = req.user.userId

  const { Task_id, Task_notes, Task_plan, updateTime, Task_state, App_Acronym } = req.body

  if (Task_notes) {
    const newTask_notes =
      `User: ${userId} , state: ${Task_state}, DateTime: ${updateTime}: \nTask has been updated \n` + `Notes: ` + Task_notes + `\n\n`
    let sql = `UPDATE task SET Task_notes = CONCAT(?,Task_notes) WHERE Task_id = ?`
    db.query(sql, [newTask_notes, Task_id], async (error, results) => {
      if (error) {
        console.log(error)
        // Handle error response
        return res.status(500).json({
          success: false,
          message: "Database error"
        })
      }
    })
  }

  if (!Task_notes) {
    const newTask_notes = `User: ${userId} , state: ${Task_state}, DateTime: ${updateTime}: \nTask has been updated \n\n`
    let sql = `UPDATE task SET Task_notes = CONCAT(?,Task_notes) WHERE Task_id = ?`
    db.query(sql, [newTask_notes, Task_id], async (error, results) => {
      if (error) {
        console.log(error)
        // Handle error response
        return res.status(500).json({
          success: false,
          message: "Database error"
        })
      }
    })
  }

  //update task -- task plan & task color from plan and plan acronym & userid
  let sql2 = `UPDATE task 
  SET Task_plan = ?,  
  Task_color = (SELECT Color FROM plan WHERE Plan_MVP_name = ? and Plan_app_Acronym= ?),
  Task_owner = ?
   WHERE Task_id = ?`
  db.query(sql2, [Task_plan, Task_plan, App_Acronym, userId, Task_id], async (error, results) => {
    if (error) {
      console.log(error)
      // Handle error response
      return res.status(500).json({
        success: false,
        message: "Database error"
      })
    } else {
      console.log("task updated")
      res.status(200).json({
        success: true,
        message: "task successfully updated"
      })
    }
  })
  // let sql3 = `UPDATE task

  //   WHERE Task_id = ?`;
  // db.query(sql3, [Task_plan, Task_id], async (error, results) => {
  //   if (error) {
  //     console.log(error);
  //     // Handle error response
  //     return res.status(500).json({
  //       success: false,
  //       message: "Database error"
  //     });
  //   }
  // });

  // //set task owner as userID
  // let sql4 = `UPDATE task SET Task_owner = ? WHERE Task_id = ?`;
  // db.query(sql4, [userId, Task_id], async (error, results) => {
  //   if (error) {
  //     console.log(error);
  //     // Handle error response
  //     return res.status(500).json({
  //       success: false,
  //       message: "Database error"
  //     });
  //   }
  // });
})

//--------Promote task -----------------------
exports.promoteTask = catchAsyncError(async (req, res, next) => {
  const userId = req.user.userId

  const { Task_name, Task_id, promoteTime, Task_state } = req.body

  const { newState, stateNote } = checkNewState(Task_state) //get the next task state and notes to show for audit trail

  //set notes
  const newTask_notes = `User: ${userId} , state: ${Task_state}, DateTime: ${promoteTime}: \n${stateNote}  \n\n`
  let sql = `UPDATE task SET Task_notes = CONCAT(?,Task_notes) WHERE Task_id = ?`
  db.query(sql, [newTask_notes, Task_id], async (error, results) => {
    if (error) {
      console.log(error)
      // Handle error response
      return res.status(500).json({
        success: false,
        message: "Database error"
      })
    }

    //set task state based on taskID
    let sql2 = `UPDATE task SET Task_state = ? WHERE Task_id = ?`
    db.query(sql2, [newState, Task_id], async (error, results) => {
      if (error) {
        console.log(error)
        // Handle error response
        return res.status(500).json({
          success: false,
          message: "Database error"
        })
      }
      //set task owner as userID
      let sql2 = `UPDATE task SET Task_owner = ? WHERE Task_id = ?`
      db.query(sql2, [userId, Task_id], async (error, results) => {
        if (error) {
          console.log(error)
          // Handle error response
          return res.status(500).json({
            success: false,
            message: "Database error"
          })
        }
        //send email to all pl when in done state
        if (newState === "done") {
          const plgroup = "%pl%"
          let sql2 = `SELECT email FROM accounts  WHERE \`group\` LIKE ?`
          db.query(sql2, [plgroup], async (error, results) => {
            if (error) {
              console.log(error)
              // Handle error response
              return res.status(500).json({
                success: false,
                message: "Database error"
              })
            }
            const allPlEmail = results.map(result => result.email)

            console.log(allPlEmail)
            for (let i = 0; i < allPlEmail.length; i++) {
              const email = allPlEmail[i]
              try {
                const message = `The Task: ${Task_name} with Task_id: ${Task_id} , has been completed and promoted to the done state for review.`
                await sendEmail({
                  email: email, //send to who
                  subject: "Review of completed task in Done state",
                  message
                })
              } catch (e) {
                console.log("error sending email", e)
              }
            }
          })
        }

        console.log("task updated")
        res.status(200).json({
          success: true,
          message: "task successfully updated"
        })
      })
    })
  })
})

function checkNewState(Task_state) {
  let newState = ""
  let stateNote = ""

  switch (Task_state) {
    case "open":
      newState = "todo"
      stateNote = "Task has been relased. Task has been promoted to Todo state"
      break
    case "todo":
      newState = "doing"
      stateNote = "Started to work on task. Task has been promoted to Doing state"
      break
    case "doing":
      newState = "done"
      stateNote = "Task has been completed. Task has been promoted to Done state"
      break
    case "done":
      newState = "close"
      stateNote = "Task has been closed. Task has been promoted to close state"
      break
  }

  return { newState, stateNote }
}

//--------demote task -----------------------
exports.demoteTask = catchAsyncError(async (req, res, next) => {
  const userId = req.user.userId

  const { Task_id, promoteTime, Task_state, Task_plan, App_Acronym } = req.body

  const { prevState, stateNote } = checkPrevState(Task_state) //get the prev task state and notes to show for audit trail

  //set notes
  const newTask_notes = `User: ${userId} , state: ${Task_state}, DateTime: ${promoteTime}: \n${stateNote} \n\n`
  let sql = `UPDATE task SET Task_notes = CONCAT(?,Task_notes) WHERE Task_id = ?`
  db.query(sql, [newTask_notes, Task_id], async (error, results) => {
    if (error) {
      console.log(error)
      // Handle error response
      return res.status(500).json({
        success: false,
        message: "Database error"
      })
    }

    let sql2 = `UPDATE task SET Task_plan = ? WHERE Task_id = ?`
    db.query(sql2, [Task_plan, Task_id], async (error, results) => {
      if (error) {
        console.log(error)
        // Handle error response
        return res.status(500).json({
          success: false,
          message: "Database error"
        })
      }
    })

    //set task state based on taskID
    let sql3 = `UPDATE task SET Task_state = ? WHERE Task_id = ?`
    db.query(sql3, [prevState, Task_id], async (error, results) => {
      if (error) {
        console.log(error)
        // Handle error response
        return res.status(500).json({
          success: false,
          message: "Database error"
        })
      }
      //set task owner as userID
      let sql4 = `UPDATE task SET Task_owner = ? WHERE Task_id = ?`
      db.query(sql4, [userId, Task_id], async (error, results) => {
        if (error) {
          console.log(error)
          // Handle error response
          return res.status(500).json({
            success: false,
            message: "Database error"
          })
        }
        let sql5 = `UPDATE task
    SET Task_color = (SELECT Color FROM plan WHERE Plan_MVP_name = ? AND Plan_app_Acronym=?)
    WHERE Task_id = ?`
        db.query(sql5, [Task_plan, App_Acronym, Task_id], async (error, results) => {
          if (error) {
            console.log(error)
            // Handle error response
            return res.status(500).json({
              success: false,
              message: "Database error"
            })
          }
        })

        console.log("task updated")
        res.status(200).json({
          success: true,
          message: "task successfully updated"
        })
      })
    })
  })
})
function checkPrevState(Task_state) {
  let prevState = ""
  let stateNote = ""

  switch (Task_state) {
    case "doing":
      prevState = "todo"
      stateNote = "Stopped working on task. Task has been demoted to todo state"
      break
    case "done":
      prevState = "doing"
      stateNote = "Task has been rejected. Task has been demoted to doing state"
      break
  }

  return { prevState, stateNote }
}
//--------update task with notes(dev or anyone )-----------------------
exports.updateTaskwithNotes = catchAsyncError(async (req, res, next) => {
  const userId = req.user.userId

  const { Task_id, Task_notes, updateTime, Task_state } = req.body
  console.log("task notes:", Task_notes)
  if (!Task_notes) {
    return next(new ErrorHandler("Please enter notes to update", 400))
  } else {
    const newTask_notes = `User: ${userId} , state: ${Task_state}, DateTime: ${updateTime}: \nTask has been updated \n` + Task_notes`\n\n`
    let sql = `UPDATE task SET Task_notes = CONCAT(?,Task_notes) WHERE Task_id = ?`
    db.query(sql, [newTask_notes, Task_id], async (error, results) => {
      if (error) {
        console.log(error)
        // Handle error response
        return res.status(500).json({
          success: false,
          message: "Database error"
        })
      }
    })
  }

  res.status(200).json({
    success: true,
    message: "task successfully updated"
  })
})
