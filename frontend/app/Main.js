import React, { useEffect, useReducer, useState } from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Route, Router, Routes } from "react-router-dom"
import axios from "axios"
import { useImmerReducer } from "use-immer"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"

//components
import Header from "./Component/Header"
import Home from "./Component/Home"
import UserManagement from "./Component/UserManagement"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import FlashMessages from "./Component/FlashMessages"
import EditUser from "./Component/EditUser"
import Profile from "./Component/Profile"
import NotFound from "./Component/NotFound"
import Landing from "./Component/Landing"
import FlashMessagesError from "./Component/FlashMessagesError"
import Unauthorised from "./Component/unauthorised"
import CreateApp from "./Component/CreateApp"
import CreateTask from "./Component/CreateTask"
import CreatePlan from "./Component/CreatePlan"
import Application from "./Component/Applications"
import TaskModal from "./Component/TaskModal"
import Plans from "./Component/Plans"

//base url for axios
axios.defaults.baseURL = process.env.BACKENDURL

function Main() {
  const initialState = {
    loggedIn: Boolean(document.cookie.includes("token")),
    flashMessages: [],
    flashMessagesError: [],
    isEditOpen: false,
    userId: "",
    userGroup: [],
    isAdmin: false,
    newUser: 0,
    editedUser: 0,
    selectedApp: "",
    openTaskModal: false,
    Task_id: "",
    taskEdited: 0,
    openAppModal: false,
    appEdited: 0,
    openPlanModal: false,
    planEdited: 0
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true
        return
      case "logout":
        draft.loggedIn = false
        return
      case "flashMessages":
        draft.flashMessages.push(action.value)
        return
      case "flashMessagesError":
        draft.flashMessagesError.push(action.value)
        return
      case "openEdit":
        draft.isEditOpen = true
        draft.userId = action.value
        return
      case "addTags":
        draft.userGroup = action.value
        return

      case "closeEdit":
        draft.isEditOpen = false
        return
      case "isAdmin":
        draft.isAdmin = true
        return
      case "isNotAdmin":
        draft.isAdmin = false
        return
      case "newUser":
        draft.newUser++
        return
      case "editedUser":
        draft.editedUser++
        return

      case "selectedApp":
        draft.selectedApp = action.value

        return
      case "openTaskModal":
        draft.openTaskModal = true
        draft.Task_id = action.value
        return
      case "closeTaskModal":
        draft.openTaskModal = false
        return
      case "taskEdited":
        draft.taskEdited++
        return
      case "openAppModal":
        draft.openAppModal = true
        return
      case "closeAppModal":
        draft.openAppModal = false
        return
      case "appEdited":
        draft.appEdited++
        return
      case "openPlanModal":
        draft.openPlanModal = true
        return
      case "closePlanModal":
        draft.openPlanModal = false
        return
      case "planEdited":
        draft.planEdited++
        return
    }
  }
  //immer give a copy of state to modify and give back to react
  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  // -----------------check if Active----
  useEffect(() => {
    if (state.loggedIn) {
      async function fetchUserStatus() {
        try {
          // need to add this to get cookies
          axios.defaults.withCredentials = true
          const response = await axios.post("/checkActive")
        } catch (e) {
          dispatch({ type: "logout" })
          dispatch({ type: "flashMessagesError", value: "Your session has expired.Please log in again" })

          console.log("There was a problem or the request was cancelled.", e.response)
        }
      }
      fetchUserStatus()
    }
  }, [state.loggedIn])

  //----check if token has expired----
  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = axios.CancelToken.source()
      async function fetchResults() {
        try {
          // need to add this to get cookies
          axios.defaults.withCredentials = true
          const response = await axios.post("/checkToken", {}, { cancelToken: ourRequest.token })

          //no response means should logout
          if (!response.data) {
            dispatch({ type: "logout" })
            dispatch({ type: "flashMessagesError", value: "Your session has expired.Please log in again" })
          }
        } catch (e) {
          dispatch({ type: "logout" })
          dispatch({ type: "flashMessagesError", value: "Your session has expired.Please log in again" })

          console.log("There was a problem or the request was cancelled.", e)
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.loggedIn])

  //------ check if is admin when logged in-------
  useEffect(() => {
    if (state.loggedIn) {
      async function isAdmin() {
        try {
          // need to add this to get cookies
          axios.defaults.withCredentials = true
          const response = await axios.post("/checkGroup")
          console.log(state.isAdmin)
          if (response.data) {
            dispatch({ type: "isAdmin" })
          }
        } catch (e) {
          dispatch({ type: "isNotAdmin" })
        }
      }
      isAdmin()
    }
  }, [state.loggedIn])
  //------------------------------------------------

  return (
    //state and dispatch can be use in any
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <BrowserRouter>
            <FlashMessages messages={state.flashMessages} />
            <FlashMessagesError messages={state.flashMessagesError} />
            <Header />
            <Routes>
              <Route path="/" element={state.loggedIn ? <Application /> : <Landing />} />
              <Route path="/" element={state.loggedIn ? "" : <Landing />} />

              <Route path="/profile" element={state.loggedIn ? <Profile /> : <Unauthorised />} />
              <Route path="/user-management" element={state.loggedIn && state.isAdmin ? <UserManagement /> : <Unauthorised />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/create-app" element={state.loggedIn ? <CreateApp /> : <Unauthorised />} />
              <Route path="/create-task/:id" element={state.loggedIn ? <CreateTask /> : <Unauthorised />} />
              <Route path="/create-plan/:id" element={state.loggedIn ? <CreatePlan /> : <Unauthorised />} />
              <Route path="/plans/:id" element={state.loggedIn ? <Plans /> : <Unauthorised />} />
              <Route path="/task-management/:id" element={state.loggedIn ? <Home /> : <Unauthorised />} />
            </Routes>
            {state.isEditOpen ? <EditUser /> : ""}
          </BrowserRouter>
        </LocalizationProvider>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render(<Main />)

if (module.hot) {
  module.hot.accept()
}
