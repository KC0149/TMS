import React, { useContext, useEffect, useState } from "react"
import Page from "./Page"
import { Link, useNavigate, useParams } from "react-router-dom"
import Axios from "axios"
import DispatchContext from "../../DispatchContext"
import { useImmerReducer } from "use-immer"
import { CSSTransition } from "react-transition-group"
import StateContext from "../../StateContext"
import CreatableSelect from "react-select/creatable"
import LoadingDotsIcon from "./LoadingDotsIcon"
import AppModel from "./AppModal"
import PlanModal from "./PlanModal"

function Plans() {
  //-----------fetch all app-----------------
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const appName = useParams().id //using the slug to call api of selected app
  const dayjs = require("dayjs")
  const navigate = useNavigate()

  const [plan, setPlan] = useState([])
  useEffect(() => {
    async function fetchPlans() {
      try {
        Axios.defaults.withCredentials = true
        const response = await Axios.post("/view-plans", { Plan_app_Acronym: appName })
        console.log(response)
        setPlan(response.data.data)
      } catch (e) {
        console.log("There was a problem or the request was cancelled.", e.response.data)
      }
    }
    fetchPlans()
  }, [appState.planEdited])

  const [selectedPlan, setSelectedPlan] = useState(null) // State to track the selected application

  async function handleInfoClick(plan) {
    try {
      // need to add this to get cookies
      Axios.defaults.withCredentials = true
      const response = await Axios.post("/checkPm")

      setSelectedPlan(plan) // Set the selected application
      appDispatch({ type: "openPlanModal" })
    } catch (e) {
      appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" })
      navigate(`/task-management/${appName}`)
      console.log("There was a problem or the request was cancelled.", e)
    }
  }

  //-----------------check if Active/pl?----
  async function handleProfile() {
    try {
      // need to add this to get cookies
      Axios.defaults.withCredentials = true
      const response = await Axios.post("/checkActive")
    } catch (e) {
      appDispatch({ type: "logout" })
      appDispatch({ type: "flashMessagesError", value: "Your session has expired.Please log in again" })
      navigate("/")
      console.log("There was a problem or the request was cancelled.", e)
    }
  }

  //-----------------check if PM------------------
  useEffect(() => {
    async function checkIsPm() {
      try {
        // need to add this to get cookies
        Axios.defaults.withCredentials = true
        const response = await Axios.post("/checkPm")
      } catch (e) {
        appDispatch({ type: "flashMessagesError", value: "You do not have the authorise rights" })
        navigate(`/task-management/${appName}`)
        console.log("There was a problem or the request was cancelled.", e)
      }
    }
    checkIsPm()
  }, [])

  return (
    <Page title={"Task Manager"}>
      <Link className="large font-weight-bold pb" to={`/task-management/${appName}`}>
        &laquo;Back
      </Link>
      <div className="appHome">
        <h1>Select a Plan to get started </h1>
        <Link to={`/create-plan/${appName}`}>
          <button onClick={handleProfile} className="btn btn-sm btn-warning mr-5" to="/profile">
            create plan
          </button>
        </Link>
        {/*-------------------for project lead---------------*/}
        <div className="container">
          <div className="row">
            <div className="col-lg appTable">
              <table className="app-table mx-auto mt-3">
                <thead>
                  <tr>
                    <th> Plan_MVP_name</th>
                    <th> Plan_startDate</th>
                    <th>Plan_endDate</th>
                    <th className="p-2">Plan_Color</th>
                  </tr>
                </thead>
                <tbody>
                  {plan?.map((plan) => (
                    <tr key={plan.Plan_MVP_name}>
                      <td>
                        <div className="appName">{plan.Plan_MVP_name}</div>
                      </td>
                      <td>{plan.Plan_startDate ? dayjs(plan.Plan_startDate).format("DD-MM-YYYY") : ""}</td>
                      <td>{plan.Plan_endDate ? dayjs(plan.Plan_endDate).format("DD-MM-YYYY") : ""}</td>
                      <td style={{ width: "50px", height: "50px", padding: "0.5em" }}>
                        <div style={{ width: "100%", height: "100%", background: plan.Color }}></div>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-info ml-2 mt-2" onClick={() => handleInfoClick(plan)}>
                          edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {appState.openPlanModal && <PlanModal plan={selectedPlan} />}
    </Page>
  )
}

export default Plans
