import React, { useContext, useEffect, useState } from "react"
import Page from "./Page"
import { Link, useNavigate } from "react-router-dom"
import Axios from "axios"
import DispatchContext from "../../DispatchContext"
import { useImmerReducer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import StateContext from "../../StateContext"
import CreatableSelect from "react-select/creatable"
import LoadingDotsIcon from "./LoadingDotsIcon"
import AppModal from "./AppModal"

function Application() {
  //-----------fetch all app-----------------
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const dayjs = require("dayjs")
  const navigate = useNavigate()

  const [app, setApp] = useState([])
  const [isPl, setIsPl] = useState(false)

  useEffect(() => {
    async function fetchApps() {
      try {
        Axios.defaults.withCredentials = true
        const response = await Axios.post("/view-app")

        setApp(response.data.data)
      } catch (e) {
        console.log("There was a problem or the request was cancelled.", e.response.data)
      }
    }
    fetchApps()
  }, [appState.appEdited])

  const [selectedApp, setSelectedApp] = useState(null) // State to track the selected application
  //------------------when edit button is pressed------------------
  async function handleInfoClick(app) {
    try {
      // need to add this to get cookies
      Axios.defaults.withCredentials = true
      const response = await Axios.post("/checkPl")
      if (response.data) {
        setIsPl(true)
        setSelectedApp(app) // Set the selected application
        appDispatch({ type: "openAppModal" })
      }
    } catch (e) {
      setIsPl(false)
      appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" })
      navigate(`/`)
      console.log("There was a problem or the request was cancelled.", e)
    }
  }

  //-----------------check if pl when create app is pressed----
  async function handleProfile() {
    try {
      // need to add this to get cookies
      Axios.defaults.withCredentials = true
      const response = await Axios.post("/checkPl")
      if (response.data) {
        setIsPl(true)
      }
    } catch (e) {
      setIsPl(false)
      appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" })
      navigate(`/`)
      console.log("There was a problem or the request was cancelled.", e)
    }
  }

  //-----------------check if PM------------------
  useEffect(() => {
    async function checkIsPl() {
      try {
        // need to add this to get cookies
        Axios.defaults.withCredentials = true
        const response = await Axios.post("/checkPl")
        if (response.data) {
          setIsPl(true)
        }
      } catch (e) {
        console.log("There was a problem or the request was cancelled.", e)
      }
    }
    checkIsPl()
  }, [])
  //----------------------------------------------------

  function handleAppClick(e, App_Acronym) {
    appDispatch({ type: "selectedApp", value: App_Acronym })
  }

  return (
    <Page title={"Task Manager"}>
      <div className="appHome">
        <h1>Select an App to get started </h1>
        {/*-------------------for project lead---------------*/}
        {isPl && (
          <Link to="/create-app">
            <button onClick={handleProfile} className="btn btn-sm btn-warning mr-5" to="/profile">
              Create app
            </button>
          </Link>
        )}
        <div className="container">
          <div className="row">
            <div className="col-lg appTable ">
              <table className="app-table mx-auto mt-3">
                <thead>
                  <tr>
                    <th> App_Acronym</th>
                    <th> App_Description</th>
                    <th> Starting_Rnumber</th>
                    <th> App_Rnumber</th>
                    <th> App_startDate</th>
                    <th> App_endDate</th>
                  </tr>
                </thead>
                {/* form inputs  */}
                <tbody>
                  {app.map(app => (
                    <tr key={app.App_Acronym}>
                      <td className="appName">
                        <div>
                          <Link className="appbtn" to={`/task-management/${app.App_Acronym}`} onClick={e => handleAppClick(e, app.App_Acronym)} key={app.App_Acronym}>
                            {app.App_Acronym}
                          </Link>
                        </div>
                      </td>
                      <td className="description-cell">
                        <p className="truncate">{app.App_Description}</p>
                      </td>
                      <td>{app.Start_Rnumber}</td>
                      <td>{app.App_Rnumber}</td>
                      <td>{app.App_startDate ? dayjs(app.App_startDate).format("DD-MM-YYYY") : ""}</td>
                      <td>{app.App_endDate ? dayjs(app.App_endDate).format("DD-MM-YYYY") : ""}</td>
                      {isPl && (
                        <td>
                          <button className="btn btn-sm btn-info ml-2 " onClick={() => handleInfoClick(app)}>
                            edit
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {appState.openAppModal && isPl && <AppModal app={selectedApp} />}
    </Page>
  )
}

export default Application
