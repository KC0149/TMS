const express = require("express")
const router = express.Router()

const { registerUser, loginUser, logout, updateUser, doesUseridExist, doesEmailExist } = require("../controllers/authController")
const { isAuthenticatedUser, authorizeRoles, checkGroup, checkAppPermit, checkAppPermitMiddle, checkAppPermitCreate } = require("../middlewares/auth")
const { updateAllUser, viewAlluser, checkToken, checkActive, viewGroups, createGroup } = require("../controllers/adminController")
const { createApp, createTask, viewApps, viewTasks, updateApp } = require("../controllers/plController")
const { createPlan, viewPlans, updatePlan } = require("../controllers/pmController")

const { updateTask, promoteTask, demoteTask } = require("../controllers/taskController")

router.get("/", (req, res) => res.json("Hello, if you see this message that means your backend is up and running successfully."))
router.route("/checkToken").post(checkToken)

router.route("/login").post(loginUser)

//-----admin
router.route("/checkGroup").post(isAuthenticatedUser, checkGroup("admin"))
router.route("/checkActive").post(isAuthenticatedUser, checkActive)
router.route("/viewUsers").post(isAuthenticatedUser, authorizeRoles("admin"), viewAlluser)
router.route("/register").post(isAuthenticatedUser, authorizeRoles("admin"), registerUser)
router.route("/updateUsers").post(isAuthenticatedUser, authorizeRoles("admin"), updateAllUser)
router.route("/viewGroups").post(isAuthenticatedUser, viewGroups)
router.route("/createGroup").post(isAuthenticatedUser, authorizeRoles("admin"), createGroup)

//----users
router.route("/update-profile").post(isAuthenticatedUser, updateUser)
router.route("/logouttms").post(isAuthenticatedUser, logout)
router.route("/view-app").post(isAuthenticatedUser, viewApps)
router.route("/view-tasks").post(isAuthenticatedUser, viewTasks)

router.route("/check-permit").post(isAuthenticatedUser, checkAppPermit) //check permit
router.route("/update-task").post(isAuthenticatedUser, checkAppPermitMiddle, updateTask)

//----PL
router.route("/checkPl").post(isAuthenticatedUser, checkGroup("pl"))
router.route("/create-app").post(isAuthenticatedUser, authorizeRoles("pl"), createApp)
router.route("/update-app").post(isAuthenticatedUser, authorizeRoles("pl"), updateApp)
router.route("/create-task").post(isAuthenticatedUser, checkAppPermitCreate, createTask) //only in app_permit_create
router.route("/promote").post(isAuthenticatedUser, checkAppPermitMiddle, promoteTask)
router.route("/demote").post(isAuthenticatedUser, checkAppPermitMiddle, demoteTask)

//--Pm
router.route("/checkPm").post(isAuthenticatedUser, checkGroup("pm"))
router.route("/create-plan").post(isAuthenticatedUser, authorizeRoles("pm"), createPlan)
router.route("/view-plans").post(isAuthenticatedUser, viewPlans)
router.route("/update-plan").post(isAuthenticatedUser, authorizeRoles("pm"), updatePlan)
router.route("/promote-task-todo").post(isAuthenticatedUser, checkAppPermitMiddle, promoteTask)

//--dev
router.route("/workon-task").post(isAuthenticatedUser, checkAppPermitMiddle, promoteTask)
router.route("/complete-task").post(isAuthenticatedUser, checkAppPermitMiddle, promoteTask)
router.route("/stop-task").post(isAuthenticatedUser, checkAppPermitMiddle, demoteTask)

module.exports = router
