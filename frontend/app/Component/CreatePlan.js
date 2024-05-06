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

function CreatePlan() {
  const navigate = useNavigate()
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)
  const currentDate = dayjs()

  const appName = useParams().id

  const initialState = {
    Plan_MVP_name: {
      value: ""
    },
    Plan_startDate: {
      value: null
    },
    Plan_endDate: {
      value: null
    },
    Plan_app_Acronym: appName,
    submitCount: 0,
    displayColorPicker: false,
    color: "#333"
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "Plan_MVP_name":
        draft.Plan_MVP_name.value = action.value
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
      const response = await Axios.post("/create-plan", {
        Plan_MVP_name: state.Plan_MVP_name.value,
        Plan_startDate: state.Plan_startDate.value,
        Plan_endDate: state.Plan_endDate.value,
        Plan_app_Acronym: state.Plan_app_Acronym,
        Color: state.color
      }) // no need :""  if same as the title
      console.log("New plan was created")
      //redirect
      navigate(`/plans/${appName}`)
      appDispatch({ type: "flashMessages", value: "CONGRATS! YOU CREATED A NEW PLAN" })
    } catch (e) {
      appDispatch({ type: "flashMessagesError", value: "Plan_MVP_name has already been used" })

      console.log("there was a problem")
    }
  }

  // function handleClick = () => {
  //   this.setState({ displayColorPicker: !this.state.displayColorPicker });
  // };

  // function handleClose = () => {
  //   this.setState({ displayColorPicker: false });
  // };

  // function handleChange = color => {
  //   this.setState({ color: color.rgb });
  // };

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

  return (
    <Page title="Create new plan">
      <Link className="large font-weight-bold pb" to={`/plans/${appName}`}>
        &laquo;Back
      </Link>
      <div className="card" style={{ width: "80%", margin: "auto" }}>
        <div className="container py-5">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="col-md-6 mb-3">
                <label htmlFor="post-title" className="text-muted mb-1">
                  <small>Plan_MVP_name</small>
                </label>
                <input
                  required
                  onChange={e => dispatch({ type: "Plan_MVP_name", value: e.target.value })}
                  autoFocus
                  name="title"
                  id="post-title"
                  className="form-control form-control"
                  type="text"
                  placeholder=""
                  autoComplete="off"
                />

                {/* color picker */}
                <div className="mt-2">
                  <div style={styles.swatch} onClick={() => dispatch({ type: "toggleColorPicker" })}>
                    <div style={styles.color} />
                  </div>
                  {state.displayColorPicker ? (
                    <div style={styles.popover}>
                      <div style={styles.cover} onClick={() => dispatch({ type: "toggleColorPicker" })} />
                      <SketchPicker color={state.color} onChange={color => dispatch({ type: "changeColor", color })} />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="col-sm-2 mb-3">
                <label htmlFor="post-title" className="text-muted mb-1">
                  <small>Plan_app_Acronym</small>
                </label>
                <input
                  value={state.Plan_app_Acronym}
                  disabled
                  autoFocus
                  name="title"
                  id="post-title"
                  className="form-control form-control"
                  type="text"
                  placeholder=""
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="form-row mb-3">
              <div className="col col-md-4">
                <label htmlFor="post-title" className="text-muted mb-1"></label>
                <DatePicker
                  views={["year", "month", "day"]}
                  onChange={newValue =>
                    dispatch({
                      type: "Plan_startDate",
                      value: dayjs(newValue?.$d).format("YYYY-MM-DD HH:mm:ss")
                    })
                  }
                  label="Plan_startDate"
                />{" "}
              </div>
              <div className="col col-md-4 ">
                <label htmlFor="post-title" className="text-muted mb-1"></label>
                <DatePicker
                  views={["year", "month", "day"]}
                  onChange={newValue =>
                    dispatch({
                      type: "Plan_endDate",
                      value: dayjs(newValue?.$d).format("YYYY-MM-DD HH:mm:ss")
                    })
                  }
                  label="Plan_endDate"
                />
              </div>
            </div>

            <button className="btn btn-primary">Create Plan</button>
          </form>
        </div>
      </div>
    </Page>
  )
}

export default CreatePlan
