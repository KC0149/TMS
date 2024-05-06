import React, { useContext, useEffect, useState } from "react"
import Page from "./Page"
import Axios from "axios"
import { Link, useNavigate, useParams } from "react-router-dom"
import StateContext from "../../StateContext"
import DispatchContext from "../../DispatchContext"
import { useImmerReducer } from "use-immer"
import Select from "react-select"
import dayjs from "dayjs"
import { DatePicker } from "@mui/x-date-pickers"
import reactCSS from "reactcss"
import { SketchPicker } from "react-color"

function PlanModal(props) {
  const navigate = useNavigate()
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)
  const currentDate = dayjs()

  const appName = useParams().id
  const { plan } = props

  const initialState = {
    Plan_MVP_name: {
      value: plan.Plan_MVP_name
    },
    Plan_startDate: {
      initial: dayjs(dayjs(plan.Plan_startDate).format("YYYY-MM-DD")),
      value: plan.Plan_startDate ? dayjs(plan.Plan_startDate).format("YYYY-MM-DD") : null
    },
    Plan_endDate: {
      initial: dayjs(dayjs(plan.Plan_endDate).format("YYYY-MM-DD")),
      value: plan.Plan_endDate ? dayjs(plan.Plan_endDate).format("YYYY-MM-DD") : null
    },
    Plan_app_Acronym: appName,
    submitCount: 0,
    displayColorPicker: false,
    color: plan.Color ? plan.Color : "fffff"
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "Plan_MVP_name":
        draft.Plan_MVP_name = action.value
        return
      case "Plan_startDate":
        draft.Plan_startDate.value = action.value
        return
      case "Plan_endDate":
        draft.Plan_endDate.value = action.value
        return
      case "Plan_app_Acronym":
        draft.Plan_app_Acronym = action.value
        return
      case "toggleColorPicker":
        draft.displayColorPicker = !draft.displayColorPicker
        return
      case "changeColor":
        draft.color = action.color.hex
        console.log(draft.color)
        return
      case "submitForm":
        // // check if email has no errors and unique & password has no errors and unique
        // if (!draft.email.hasErrors && !draft.password.hasErrors) {
        //   draft.submitCount++;
        // }
        // // check if email is empty & password has no errors and unique

        // if (draft.email.optional && !draft.password.optional && !draft.password.hasErrors) {
        //   draft.submitCount++;
        // }
        // // check if email has no errors and unique & password is empty
        // if (!draft.email.optional && draft.password.optional && !draft.email.hasErrors) {
        //   draft.submitCount++;
        // }

        // // check if email has no errors and unique & password is empty
        // if (draft.email.optional && draft.password.optional) {
        //   draft.submitCount++;
        // }
        // //if has errors give error message
        // if (draft.email.hasErrors || draft.password.hasErrors) {
        //   appDispatch({ type: "flashMessagesError", value: "There was an error creating user. Check inputs" });
        // }

        return

      case "RESET":
        return initialState
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      const response = await Axios.post("/update-plan", { Plan_MVP_name: state.Plan_MVP_name.value, Plan_startDate: state.Plan_startDate.value, Plan_endDate: state.Plan_endDate.value, Plan_app_Acronym: state.Plan_app_Acronym, Color: state.color }) // no need :""  if same as the title
      console.log("Plan was update")
      appDispatch({ type: "closePlanModal" }) //close modal
      appDispatch({ type: "planEdited" }) //refresh app page api call

      appDispatch({ type: "flashMessages", value: "CONGRATS! YOU HAVE UPDATED A PLAN" })
    } catch (e) {
      console.log("there was a problem")
    }
  }

  const styles = reactCSS({
    default: {
      color: {
        width: "36px",
        height: "14px",
        borderRadius: "2px",
        background: state.color
      },
      swatch: {
        padding: "5px",
        background: "#fff",
        borderRadius: "1px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        display: "inline-block",
        cursor: "pointer"
      },
      popover: {
        position: "absolute",
        zIndex: "2"
      },
      cover: {
        position: "fixed",
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px"
      }
    }
  })

  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler)
    return () => document.removeEventListener("keyup", searchKeyPressHandler)
  }, [])

  //closing edit with escape key
  function searchKeyPressHandler(e) {
    if (e.keyCode == 27) {
      appDispatch({ type: "closePlanModal" })
    }
  }

  return (
    <div className="search-overlay">
      <Page title="Edit plan">
        <span onClick={(e) => appDispatch({ type: "closePlanModal" })} className="close-live-search">
          <i className="fas fa-times-circle"></i>
        </span>
        <div className="card mt-5 appModal" style={{ width: "80%", margin: "auto" }}>
          <div className="container py-5">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="post-title" className="text-muted mb-1">
                    <small>Plan_MVP_name</small>
                  </label>
                  <input disabled value={state.Plan_MVP_name.value} autoFocus name="title" id="post-title" className="form-control form-control" type="text" placeholder="" autoComplete="off" />

                  {/* color picker */}
                  <div className="mt-2">
                    <div style={styles.swatch} onClick={() => dispatch({ type: "toggleColorPicker" })}>
                      <div style={styles.color} />
                    </div>
                    {state.displayColorPicker ? (
                      <div style={styles.popover}>
                        <div style={styles.cover} onClick={() => dispatch({ type: "toggleColorPicker" })} />
                        <SketchPicker color={state.color} onChange={(color) => dispatch({ type: "changeColor", color })} />
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="col-sm-2 mb-3">
                  <label htmlFor="post-title" className="text-muted mb-1">
                    <small>Plan_app_Acronym</small>
                  </label>
                  <input value={state.Plan_app_Acronym} disabled autoFocus name="title" id="post-title" className="form-control form-control" type="text" placeholder="" autoComplete="off" />
                </div>
              </div>

              <div className="form-row mb-3">
                <div className="col col-md-4">
                  <label htmlFor="post-title" className="text-muted mb-1"></label>
                  <DatePicker defaultValue={state.Plan_startDate.initial} views={["year", "month", "day"]} onChange={(newValue) => dispatch({ type: "Plan_startDate", value: dayjs(newValue?.$d).format("YYYY-MM-DD HH:mm:ss") })} label="Plan_startDate" />{" "}
                </div>
                <div className="col col-md-4 ">
                  <label htmlFor="post-title" className="text-muted mb-1"></label>
                  <DatePicker defaultValue={state.Plan_endDate.initial} views={["year", "month", "day"]} onChange={(newValue) => dispatch({ type: "Plan_endDate", value: dayjs(newValue?.$d).format("YYYY-MM-DD HH:mm:ss") })} label="Plan_endDate" />
                </div>
              </div>

              <button className="btn btn-primary">Update Plan</button>
            </form>
          </div>
        </div>
      </Page>
    </div>
  )
}

export default PlanModal
